use std::process::{Command, Stdio};
use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder},
    AppHandle, Manager, Runtime,
};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

const FINN_API_URL: &str = "http://127.0.0.1:8766";
const FINN_DOCS_URL: &str = "https://github.com/DasVR/finn-pentest-harness";

fn show_main(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
    }
}

fn focus_shortcut() -> Shortcut {
    #[cfg(target_os = "macos")]
    {
        Shortcut::new(Some(Modifiers::SUPER | Modifiers::SHIFT), Code::KeyF)
    }
    #[cfg(not(target_os = "macos"))]
    {
        Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::KeyF)
    }
}

/// Check whether the Finn FastAPI backend is reachable.
async fn backend_reachable() -> bool {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(2))
        .build();
    if let Ok(c) = client {
        if let Ok(resp) = c.get(format!("{}/health", FINN_API_URL)).send().await {
            return resp.status().is_success();
        }
    }
    false
}

/// Show a system dialog when the backend is offline. The user can open the
/// docs or dismiss and run in "offline" mode (shell only, no tools).
fn show_backend_offline_dialog(app: &AppHandle) {
    let app_clone = app.clone();
    tauri::async_runtime::spawn(async move {
        let handle = app_clone.get_webview_window("main");
        let Some(window) = handle else {
            return;
        };
        let msg = "The Finn backend is not running at http://127.0.0.1:8766.\n\nYou can still browse the UI, but scans and tool execution will be unavailable.\n\nStart the backend with: finn server";
        let _ = window
            .dialog()
            .message(msg)
            .title("Finn backend offline")
            .kind(tauri::api::dialog::MessageDialogKind::Info)
            .ok_button_label("Got it")
            .show(|result| {
                if let Ok(true) = result {
                    // optional: deep-link to docs
                    let _ = tauri::api::shell::open(
                        &app_clone.shell_scope(),
                        FINN_DOCS_URL,
                        None,
                    );
                }
            });
    });
}

/// No-sudo policy helper.
///
/// Returns true if the current process is running as root/Administrator.
/// On macOS/Linux this checks uid == 0. On Windows it checks for an admin SID.
/// Pentest tools should gate privileged operations through the approval
/// workflow and explain to the user that Finn refuses to run tools with
/// implicit admin rights.
#[cfg(unix)]
pub fn running_as_root() -> bool {
    unsafe { libc::getuid() == 0 }
}

#[cfg(windows)]
pub fn running_as_root() -> bool {
    is_elevated::is_elevated()
}

/// Explain why sudo was requested for a specific command. This returns a
/// markdown-ready message that the frontend can render in the approval gate.
#[tauri::command]
pub fn explain_sudo_request(command: String) -> String {
    format!(
        "This tool asked to run with administrator privileges:\n\n```\n{}\n```\n\n\
         Finn's no-sudo policy requires a non-elevated alternative to be tried first. \
         If the tool genuinely cannot work without root (for example, raw socket scans or certain packet captures), \
         you can approve the elevated version after reviewing exactly what it will do.",
        command
    )
}

/// Wrap a command so it is refused if it would execute with implicit root.
/// The frontend calls this to validate before invoking the backend executor.
#[tauri::command]
pub fn check_sudo_policy(command: String) -> Result<String, String> {
    if running_as_root() {
        return Err(
            "Finn is running with administrator privileges. \
             Please restart Finn as a normal user. \
             Only individual tool actions may be elevated after approval, never the entire app."
                .to_string(),
        );
    }
    if command.starts_with("sudo ") || command.starts_with("doas ") {
        return Err(
            "Finn does not allow commands prefixed with sudo/doas. \
             If elevation is required, approve the elevated action in the tool gate instead."
                .to_string(),
        );
    }
    Ok("ok".to_string())
}

fn backend_status_string() -> String {
    if backend_reached_sync() {
        "Backend: online".to_string()
    } else {
        "Backend: offline".to_string()
    }
}

fn backend_reached_sync() -> bool {
    let output = Command::new("curl")
        .args([
            "-fsS",
            "--max-time",
            "1",
            &format!("{}/health", FINN_API_URL),
        ])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status();
    matches!(output, Ok(s) if s.success())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_http::init())
        .invoke_handler(tauri::generate_handler![check_sudo_policy, explain_sudo_request])
        .setup(|app| {
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Regular);

            // macOS native About panel values
            #[cfg(target_os = "macos")]
            {
                app.set_about_panel_metadata(Some(tauri::AboutMetadata::new(
                    Some("Finn Pentest Harness"),
                    Some("0.2.1"),
                    Some("Finn Labs"),
                    Some("https://github.com/DasVR/finn-pentest-harness"),
                )));
            }

            let show = MenuItem::with_id(app, "show", "Show Finn", true, None::<&str>)?;
            let hide = MenuItem::with_id(app, "hide", "Hide Finn", true, None::<&str>)?;
            let about = MenuItem::with_id(app, "about", "About Finn", true, None::<&str>)?;
            let perms = MenuItem::with_id(app, "permissions", "Permissions…", true, None::<&str>)?;
            let status = MenuItem::with_id(app, "status", &backend_status_string(), false, None::<&str>)?;
            let sep = PredefinedMenuItem::separator(app)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

            let menu = Menu::with_items(
                app,
                &[&show, &hide, &sep, &status, &sep, &about, &perms, &sep, &quit],
            )?;

            let app_handle = app.handle().clone();
            let status_item = status.clone();
            if let Err(err) = TrayIconBuilder::new()
                .menu(&menu)
                .show_menu_on_left_click(true)
                .on_menu_event(move |app, event| match event.id.as_ref() {
                    "show" => show_main(app),
                    "hide" => {
                        if let Some(w) = app.get_webview_window("main") {
                            let _ = w.hide();
                        }
                    }
                    "about" => {
                        #[cfg(target_os = "macos")]
                        {
                            let _ = app.show_about_panel();
                        }
                        #[cfg(not(target_os = "macos"))]
                        {
                            let _ = tauri::api::shell::open(
                                &app.shell_scope(),
                                FINN_DOCS_URL,
                                None,
                            );
                        }
                    }
                    "permissions" => {
                        let body = "Finn requires these macOS permissions:\n\n\
                        • Accessibility — Cmd+Shift+F global shortcut\n\
                        • Local Network — talk to backend on 127.0.0.1:8766\n\
                        • Files & Folders — read pentest scripts and write reports to ~/finn\n\n\
                        Administrator access is never used automatically. \
                        Individual tools may request elevation through the approval gate.";
                        if let Some(w) = app.get_webview_window("main") {
                            let _ = w
                                .dialog()
                                .message(body)
                                .title("Finn Permissions")
                                .ok_button_label("Open System Settings")
                                .show(move |result| {
                                    if let Ok(true) = result {
                                        #[cfg(target_os = "macos")]
                                        {
                                            let _ = std::process::Command::new("open")
                                                .arg("x-apple.systempreferences:com.apple.preference.security?Privacy")
                                                .spawn();
                                        }
                                    }
                                });
                        }
                    }
                    "quit" => app.exit(0),
                    _ => {}
                })
                .on_tray_icon_event(move |tray, event| {
                    if let tauri::tray::TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        show_main(app);
                    }
                })
                .build(app)
            {
                eprintln!("Finn: tray icon not created ({err})");
            }

            // Refresh backend status in tray every 10 seconds
            tauri::async_runtime::spawn(async move {
                let mut interval = tokio::time::interval(std::time::Duration::from_secs(10));
                loop {
                    interval.tick().await;
                    let label = if backend_reachable().await {
                        "Backend: online"
                    } else {
                        "Backend: offline"
                    };
                    let _ = status_item.set_text(label);
                }
            });

            // macOS rejects global shortcuts without Accessibility permission.
            // Do not fail launch; just log it.
            if let Err(err) = app.global_shortcut().on_shortcut(
                focus_shortcut(),
                |app, _sc, event| {
                    if event.state == ShortcutState::Pressed {
                        show_main(app);
                    }
                },
            ) {
                eprintln!("Finn: global shortcut not registered ({err})");
            }

            // Check backend on startup (best-effort; do not block launch)
            let app_clone = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                if !backend_reachable().await {
                    show_backend_offline_dialog(&app_clone);
                }
            });

            // No-sudo warning if somehow launched as root
            if running_as_root() {
                if let Some(w) = app.get_webview_window("main") {
                    let _ = w
                        .dialog()
                        .message("Finn is running as an administrator. \
                            Please restart as a normal user. \
                            Tools will be blocked until you do.")
                        .title("Administrator mode blocked")
                        .kind(tauri::api::dialog::MessageDialogKind::Warning)
                        .ok_button_label("Quit")
                        .show(move |result| {
                            if let Ok(true) = result {
                                std::process::exit(0);
                            }
                        });
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Finn");
}
