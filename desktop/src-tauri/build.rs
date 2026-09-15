use tauri_build::{Attributes, WindowsAttributes};

fn main() {
    // Windows only (ignored on other hosts): tauri-build's default manifest declares
    // just Common Controls v6, and DPI awareness is otherwise set by tao at runtime
    // after the process has started. Declaring PerMonitorV2 in the manifest fixes it
    // before any HWND or WebView2 initialization, so scale changes between monitors
    // resize the frameless window and its webview without a blurry first frame.
    let windows = WindowsAttributes::new().app_manifest(include_str!("windows-app-manifest.xml"));
    tauri_build::try_build(Attributes::new().windows_attributes(windows))
        .expect("failed to run tauri-build");
}
