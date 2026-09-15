// Windows only. Injected by src/windows.rs as an initialization script, before the
// SvelteKit bundle runs.
//
// On Windows the main window is frameless (tauri.windows.conf.json), so the
// SvelteKit titlebar is the only window chrome. That chrome targets two global
// shapes Tauri 2 does not ship:
//   window.__TAURI__.window.current().dragMove()                      (Titlebar.svelte)
//   window.__TAURI__.appWindow.{minimize,toggleMaximize,close,
//                               isMaximized,onMaximizedChanged}       (WindowControls.svelte)
// This maps both onto window.__TAURI__.window.getCurrentWindow(), which exists when
// app.withGlobalTauri is true. Permissions: capabilities/windows-chrome.json.
(function () {
  const tauri = window.__TAURI__;
  if (!tauri || !tauri.window || typeof tauri.window.getCurrentWindow !== 'function') return;

  const current = tauri.window.getCurrentWindow();

  const controls = {
    minimize: () => void current.minimize(),
    toggleMaximize: () => void current.toggleMaximize(),
    close: () => void current.close(),
    isMaximized: () => current.isMaximized(),
    onMaximizedChanged: (callback) => {
      void current.onResized(async () => {
        callback({ payload: await current.isMaximized() });
      });
    },
    // Titlebar calls this on mousemove while the primary button is held.
    dragMove: () => void current.startDragging(),
  };

  if (!tauri.appWindow) tauri.appWindow = controls;
  if (typeof tauri.window.current !== 'function') tauri.window.current = () => controls;
})();
