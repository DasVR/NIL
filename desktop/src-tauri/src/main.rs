// NIL desktop shell.
//
// Deliberately small: this hosts the SvelteKit workstation UI (../../frontend/build)
// and adds the native macOS chrome that a browser tab can't — a real menu bar and
// window management. Keyboard shortcuts are intentionally NOT bound here as menu
// accelerators; the SvelteKit `keymap.svelte.ts` already owns every chord (⌘K, ⌘J,
// ⌘Y, ⌘N, ⌘T, ⌘, ...). Binding accelerators natively would let the menu swallow
// those keys before the webview sees them, and only three of them have an event
// bridge back into the UI — so the rest would silently break. The NIL menu items
// below are therefore clickable, accelerator-free entry points that emit the exact
// events the UI already listens for (see frontend/src/lib/tauri-events.ts).
//
// Windows is the exception on both counts (see windows.rs): the window there is
// frameless with the SvelteKit titlebar as the only chrome, and a Win32 menu bar
// would be drawn as a light classic strip above it — so no native menu is attached
// on Windows, and the same three actions stay reachable through the in-webview
// keymap.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(target_os = "windows")]
mod windows;

#[cfg(not(target_os = "windows"))]
use tauri::menu::{AboutMetadata, Menu, MenuItem, PredefinedMenuItem, Submenu};
#[cfg(not(target_os = "windows"))]
use tauri::{AppHandle, Runtime};
use tauri::Emitter;

/// Menu ids that map 1:1 onto the events wired in frontend/src/lib/tauri-events.ts.
const EVENT_OPEN_PALETTE: &str = "nil:open-palette";
const EVENT_FOCUS_COMPOSER: &str = "nil:focus-composer";
const EVENT_TOGGLE_YOLO: &str = "nil:toggle-yolo";

#[cfg(not(target_os = "windows"))]
fn build_menu<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<Menu<R>> {
    let app_menu = Submenu::with_items(
        app,
        "NIL",
        true,
        &[
            &PredefinedMenuItem::about(app, Some("NIL"), Some(AboutMetadata::default()))?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::services(app, None)?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::hide(app, None)?,
            &PredefinedMenuItem::hide_others(app, None)?,
            &PredefinedMenuItem::show_all(app, None)?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::quit(app, None)?,
        ],
    )?;

    // Standard editing chords (⌘Z/⌘X/⌘C/⌘V/⌘A). Without this submenu, copy and
    // paste do not work inside the webview on macOS.
    let edit_menu = Submenu::with_items(
        app,
        "Edit",
        true,
        &[
            &PredefinedMenuItem::undo(app, None)?,
            &PredefinedMenuItem::redo(app, None)?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::cut(app, None)?,
            &PredefinedMenuItem::copy(app, None)?,
            &PredefinedMenuItem::paste(app, None)?,
            &PredefinedMenuItem::select_all(app, None)?,
        ],
    )?;

    let palette = MenuItem::with_id(app, EVENT_OPEN_PALETTE, "Command palette", true, None::<&str>)?;
    let composer = MenuItem::with_id(app, EVENT_FOCUS_COMPOSER, "Focus composer", true, None::<&str>)?;
    let yolo = MenuItem::with_id(app, EVENT_TOGGLE_YOLO, "Toggle YOLO", true, None::<&str>)?;
    let actions_menu = Submenu::with_items(app, "Actions", true, &[&palette, &composer, &yolo])?;

    // Deliberately no "Close Window" (⌘W) here: the SvelteKit keymap uses ⌘W to
    // close the active tab/dock, so letting the OS menu claim it would close the
    // whole window instead.
    let window_menu = Submenu::with_items(
        app,
        "Window",
        true,
        &[
            &PredefinedMenuItem::minimize(app, None)?,
            &PredefinedMenuItem::maximize(app, None)?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::fullscreen(app, None)?,
        ],
    )?;

    Menu::with_items(app, &[&app_menu, &edit_menu, &actions_menu, &window_menu])
}

fn main() {
    let builder = tauri::Builder::default();
    #[cfg(not(target_os = "windows"))]
    let builder = builder.menu(|app| build_menu(app));

    builder
        .setup(|_app| {
            #[cfg(target_os = "windows")]
            windows::create_windows(_app.handle())?;
            Ok(())
        })
        .on_menu_event(|app, event| {
            let id = event.id().as_ref();
            if matches!(id, EVENT_OPEN_PALETTE | EVENT_FOCUS_COMPOSER | EVENT_TOGGLE_YOLO) {
                // Broadcast to the webview; frontend/src/lib/tauri-events.ts handles it.
                let _ = app.emit(id, ());
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running the NIL desktop shell");
}
