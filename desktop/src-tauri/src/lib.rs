use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    AppHandle, Manager,
};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Register plugins in Rust only. Do not add a `plugins` object to
    // tauri.conf.json — `"notification": {}` / `"global-shortcut": {}` panic with
    // `invalid type: map, expected unit`.
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Regular);

            let show = MenuItem::with_id(app, "show", "Show Finn", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show, &quit])?;
            if let Err(err) = TrayIconBuilder::new()
                .menu(&menu)
                .show_menu_on_left_click(true)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => show_main(app),
                    "quit" => app.exit(0),
                    _ => {}
                })
                .build(app)
            {
                eprintln!("Finn: tray icon not created ({err})");
            }

            // macOS rejects global shortcuts without Accessibility permission
            // (GitHub-hosted runners do not grant it). Do not fail launch.
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
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Finn");
}
