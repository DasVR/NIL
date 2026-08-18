use std::process::{Command, Stdio};
use tauri::{
    menu::{AboutMetadata, Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder},
    AppHandle, Manager,
};
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons};
use tauri_plugin_clipboard_manager::ClipboardExt;
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};
use tauri_plugin_shell::ShellExt;

const FINN_API_URL: &str = "http://127.0.0.1:8766";
const FINN_DOCS_URL: &str = "https://github.com/DasVR/finn-pentest-harness";
const FINN_BACKEND_CMD: &str = "finn server";

/// Attempt to start the Finn backend silently (no visible terminal window).
fn start_backend_silently() {
    // Try 'finn' binary directly (assumes it's in PATH or installed via pipx)
    let mut child = std::process::Command::new("finn");
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        child.creation_flags(CREATE_NO_WINDOW);
    }

    let result = child
        .arg("server")
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn();

    if result.is_ok() {
        return;
    }

    // Fallback: try `python -m finn server`
    let mut fallback = std::process::Command::new("python");
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        fallback.creation_flags(CREATE_NO_WINDOW);
    }

    let _ = fallback
        .args(["-m", "finn", "server"])
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn();
}

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

/// Show a non-blocking native dialog when the backend is offline.
fn show_backend_offline_dialog(app: &AppHandle) {
    let app_clone = app.clone();
    tauri::async_runtime::spawn(async move {
        // Slight delay so the window exists before the dialog appears.
        tokio::time::sleep(std::time::Duration::from_millis(800)).await;
        let msg = format!(
            "The Finn backend is not running at {}.\\n\\n\
             You can still browse the UI, but scans and tool execution will be unavailable.\\n\\n\
             Start the backend with: {}",
            FINN_API_URL, FINN_BACKEND_CMD
        );
        if let Some(window) = app_clone.get_webview_window("main") {
            let _ = window
                .dialog()
                .message(msg)
                .title("Finn backend offline")
                .buttons(MessageDialogButtons::OkCustom("Copy command".into()))
                .show(move |result| {
                    if result {
                        let _ = app_clone.clipboard().write_text(FINN_BACKEND_CMD);
                        let _ = app_clone.shell().open(FINN_DOCS_URL, None);
                    }
                });
        }
    });
}

/// Returns true if the process is running with elevated privileges.
#[cfg(unix)]
pub fn running_as_root() -> bool {
    unsafe { libc::getuid() == 0 }
}

#[cfg(windows)]
pub fn running_as_root() -> bool {
    // Requires `is_elevated` crate on Windows. For now, return false.
    false
}

#[cfg(not(any(unix, windows)))]
pub fn running_as_root() -> bool {
    false
}

/// Explain why sudo was requested for a specific command.
#[tauri::command]
fn explain_sudo_request(command: String) -> String {
    format!(
        "This tool asked to run with administrator privileges:\\n\\n```\\n{}\\n```\\n\\n\
         Finn's no-sudo policy requires a non-elevated alternative to be tried first. \
         If the tool genuinely cannot work without root (for example raw sockets or certain packet captures), \
         approve the elevated version after reviewing exactly what it will do.",
        command
    )
}

/// Validate that a command does not bypass the no-sudo policy.
#[tauri::command]
fn check_sudo_policy(command: String) -> Result<String, String> {
    if running_as_root() {
        return Err(
            "Finn is running with administrator privileges. \
             Please restart Finn as a normal user. \
             Only individual tool actions may be elevated after approval, never the entire app."
                .to_string(),
        );
    }
    let lower = command.to_lowercase();
    if lower.starts_with("sudo ") || lower.starts_with("doas ") {
        return Err(
            "Finn does not allow commands prefixed with sudo/doas. \
             If elevation is required, approve the elevated action in the tool gate instead."
                .to_string(),
        );
    }
    Ok("ok".to_string())
}

fn backend_status_string() -> String {
    // Use a synchronous best-effort check for menu init.
    let output = Command::new("curl")
        .args(["-fsS", "--max-time", "1", &format!("{}/health", FINN_API_URL)])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status();
    if output.map(|s| s.success()).unwrap_or(false) {
        "Backend: online".to_string()
    } else {
        "Backend: offline".to_string()
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(tauri::generate_handler![check_sudo_policy, explain_sudo_request])
        .setup(|app| {
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Regular);

            let show = MenuItem::with_id(app, "show", "Show Finn", true, None::<&str>)?;
            let hide = MenuItem::with_id(app, "hide", "Hide Finn", true, None::<&str>)?;
            let about = PredefinedMenuItem::about(
                app,
                Some("About Finn"),
                Some(AboutMetadata {
                    name: Some("Finn Pentest Harness".into()),
                    version: Some("0.2.1".into()),
                    short_version: Some("0.2.1".into()),
                    authors: Some(vec!["Finn Labs".into()]),
                    website: Some("https://github.com/DasVR/finn-pentest-harness".into()),
                    ..Default::default()
                }),
            )?;
            let perms = MenuItem::with_id(app, "permissions", "Permissions…", true, None::<&str>)?;
            let status = MenuItem::with_id(app, "status", &backend_status_string(), false, None::<&str>)?;
            let sep = PredefinedMenuItem::separator(app)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

            let menu = Menu::with_items(
                app,
                &[&show, &hide, &sep, &status, &sep, &about, &perms, &sep, &quit],
            )?;

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
                        let _ = app.shell().open(FINN_DOCS_URL, None);
                    }
                    "permissions" => {
                        let body = "Finn requires these macOS permissions:\\n\\n\
                        • Accessibility — Cmd+Shift+F global shortcut (optional)\\n\
                        • Local Network — talk to backend on 127.0.0.1:8766\\n\
                        • Files & Folders — read pentest scripts and write reports\\n\\n\
                        Administrator access is never used automatically. \
                        Individual tools may request elevation through the approval gate.";
                        let app_handle = app.clone();
                        if let Some(w) = app.get_webview_window("main") {
                            let _ = w
                                .dialog()
                                .message(body)
                                .title("Finn Permissions")
                                .buttons(MessageDialogButtons::OkCustom("Open System Settings".into()))
                                .show(move |result| {
                                    if result {
                                        let _ = app_handle
                                            .shell()
                                            .open("x-apple.systempreferences:com.apple.preference.security?Privacy", None);
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

            // Refresh backend status in tray periodically.
            let app_handle = app.handle().clone();
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

            // Global shortcut: best-effort, no failure on missing Accessibility.
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

            // Check backend on startup (non-blocking).
            let app_clone = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                if !backend_reachable().await {
                    // Attempt to auto-start the backend
                    start_backend_silently();
                    // Poll for up to 10s
                    let mut attempts = 0;
                    while attempts < 20 {
                        tokio::time::sleep(std::time::Duration::from_millis(500)).await;
                        if backend_reachable().await {
                            return;
                        }
                        attempts += 1;
                    }
                    // Still offline — show dialog
                    show_backend_offline_dialog(&app_clone);
                }
            });

            // No-sudo warning if launched as root/admin.
            if running_as_root() {
                if let Some(w) = app.get_webview_window("main") {
                    let _ = w
                        .dialog()
                        .message(
                            "Finn is running as an administrator. \
                            Please restart as a normal user. \
                            Tools will be blocked until you do.",
                        )
                        .title("Administrator mode blocked")
                        .buttons(MessageDialogButtons::OkCustom("Quit".into()))
                        .show(move |result| {
                            if result {
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
