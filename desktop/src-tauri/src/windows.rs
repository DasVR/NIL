//! Windows-specific shell setup. Compiled only on Windows (see main.rs).
//!
//! On Windows the main window is frameless — tauri.windows.conf.json sets
//! `decorations: false` and `create: false` — so the SvelteKit titlebar is the only
//! window chrome. Window creation happens here instead of the config loader so the
//! chrome bridge can be attached as an initialization script, which is the only hook
//! that runs before the frontend bundle.

use tauri::{AppHandle, WebviewWindowBuilder};

/// Maps the window-control globals the SvelteKit chrome already calls onto the
/// Tauri 2 global API. Retire once the chrome imports `@tauri-apps/api/window`
/// directly.
const CHROME_BRIDGE: &str = include_str!("chrome_bridge.js");

pub fn create_windows(app: &AppHandle) -> tauri::Result<()> {
    let windows = app.config().app.windows.clone();
    for config in &windows {
        WebviewWindowBuilder::from_config(app, config)?
            .initialization_script(CHROME_BRIDGE)
            .build()?;
    }
    Ok(())
}
