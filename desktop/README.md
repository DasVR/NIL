# NIL desktop shell (Tauri 2)

This is the macOS/Windows/Linux desktop shell for NIL. It is intentionally thin:
it hosts the existing SvelteKit workstation UI (`../frontend`) inside a native
window and adds the things a browser tab can't — a real menu bar, native window
chrome, and OS packaging/signing.

It does **not** re-implement any product UI. The webview loads
`../frontend/build` (SvelteKit `adapter-static`).

## Layout

```
desktop/
  package.json            # @tauri-apps/cli wrapper; `npm run tauri -- ...`
  scripts/
    macos-launch-smoke.sh  # CI sanity: bundle well-formed, signed, boots
    macos-zip-app.sh       # assembles Finn-Setup .pkg/.dmg/kit from the .app
    windows-smoke.ps1      # CI: launch + NSIS/MSI silent install round-trips
  src-tauri/
    tauri.conf.json        # window chrome, bundle + macOS signing config
    tauri.windows.conf.json  # Windows-only overlay: frameless dark window, NSIS/MSI
    Cargo.toml, build.rs   # build.rs also embeds the Windows DPI manifest
    windows-app-manifest.xml # Common Controls v6 + PerMonitorV2 (Windows only)
    src/main.rs            # native menu + event bridge to the UI
    src/windows.rs         # Windows: creates the frameless window, injects the bridge
    src/chrome_bridge.js   # Windows: maps the chrome's window globals onto Tauri 2
    Entitlements.plist     # Hardened Runtime exceptions (NOT App Sandbox)
    capabilities/default.json
    capabilities/windows-chrome.json  # Windows-only window-control permissions
    icons/                 # generated from frontend/static/nil-icon.png
```

## Build

Prerequisites: Node 22+, Rust stable (>= 1.85 — a transitive dep needs
`edition2024`), and the platform toolchain (Xcode CLT on macOS; the deps in
`linux-desktop.yml` on Linux).

```bash
npm ci --prefix ../frontend   # the shell embeds ../frontend/build
npm ci                        # installs @tauri-apps/cli here
npm run tauri -- build --bundles app,dmg   # macOS: NIL.app + NIL_x.y.z.dmg
```

`tauri.conf.json > build.beforeBuildCommand` runs `npm --prefix ../frontend run
build` for you, so the only manual step is installing the frontend deps once.

Dev loop: `npm run tauri -- dev` (starts the Vite dev server via
`beforeDevCommand` and points the webview at `http://localhost:5173`).

## Window chrome and menus

- Window: `titleBarStyle: "Overlay"` + `hiddenTitle: true` + `decorations: true`.
  This keeps the **native macOS traffic lights** (per the design law: "native
  Tauri overlay only — no CSS traffic lights") while the SvelteKit titlebar draws
  the rest of the strip. Dragging works through the existing
  `-webkit-app-region: drag` region in `Titlebar.svelte`.
- `withGlobalTauri: true` so `window.__TAURI__` exists — the frontend gates
  `setupTauriEvents()` and its terminal wiring on that flag.
- Menu (`src/main.rs`): standard **App** and **Edit** submenus (About, Hide,
  Quit, and — critically — Undo/Cut/Copy/Paste/Select-All, without which
  copy-paste does not work in a macOS webview), a **Window** submenu
  (Minimize/Zoom/Full Screen), and an **Actions** submenu with
  *Command palette*, *Focus composer*, and *Toggle YOLO*.
- The Actions items carry **no keyboard accelerators on purpose**. The SvelteKit
  `keymap.svelte.ts` already owns every chord (⌘K, ⌘J, ⌘Y, ⌘N, ⌘T, ⌘, …). A
  native accelerator would intercept the key before the webview sees it, and only
  three actions have an event bridge back into the UI — the rest would silently
  break. Clicking an Actions item emits the exact event the UI listens for
  (`nil:open-palette`, `nil:focus-composer`, `nil:toggle-yolo`).

## Signing, Gatekeeper, and notarization

The macOS story here is **ad-hoc signing + Hardened Runtime**, which is enough to
run after quarantine is cleared. Full notarization needs Apple credentials that
are not in this repo.

- `bundle.macOS.signingIdentity: "-"` → ad-hoc signature. Apple Silicon refuses
  unsigned Mach-O, so this is the minimum to launch.
- `bundle.macOS.hardenedRuntime: true` + `Entitlements.plist`. The entitlements
  are Hardened-Runtime exceptions (JIT, unsigned executable memory, disabled
  library validation, network client/server). **App Sandbox is deliberately
  off**: NIL spawns arbitrary security tooling and binds local sockets, which the
  sandbox forbids. App Sandbox is only required for the Mac App Store, which is
  not a distribution target for a pentest tool.
- Gatekeeper: GitHub sets `com.apple.quarantine` on downloads. `install.txt`,
  `fix-gatekeeper.command`, and the `postinstall` script clear it and re-sign.

### To notarize (platform engineer, needs Apple Developer account)

1. Provide a "Developer ID Application" certificate and set, in CI secrets:
   `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`,
   `APPLE_ID`, `APPLE_PASSWORD` (app-specific), `APPLE_TEAM_ID`.
2. Set `bundle.macOS.signingIdentity` to the Developer ID identity (or leave `-`
   and let `APPLE_SIGNING_IDENTITY` override it).
3. Tauri notarizes automatically when the Apple env vars are present. See
   https://v2.tauri.app/distribute/sign/macos/.

Until then the app is ad-hoc signed and users must clear quarantine once.

## The three QA smokes (run on a real macOS build)

CI's `macos-launch-smoke.sh` only proves the bundle is well-formed, signed, and
boots. The acceptance gate below is **interactive** and must be run by a human on
a Mac against the built `NIL.app`.

```bash
# 1. Build + clear quarantine + open
npm ci --prefix ../frontend && npm ci
npm run tauri -- build --bundles app,dmg
APP="src-tauri/target/release/bundle/macos/NIL.app"
xattr -cr "$APP"
open "$APP"
```

For live agent/stream data, also start the backend API in another terminal
(`pip install` the release wheel, then `finn api`, serving `127.0.0.1:8766`). The
empty-state flows below work without it.

1. **Empty shell → recover into a useful next action.** Launch with no
   engagement. Confirm the Welcome / empty state names the next action and that
   *Actions ▸ Focus composer* (or clicking the empty-state CTA) lands the cursor
   in the composer ready to type.
2. **Dense proposal → scan + act on the primary, no theater.** Drive the agent to
   a proposal/approval. Confirm you can scan it and act on the primary
   (approve/reject) without motion theater, and that severity color is the only
   saturated color on screen.
3. **Engaged stream → stay oriented under load.** Start a hunt so the stream
   fills. Confirm you stay oriented (jump-to-latest, status reads as a short
   briefing) and high-contrast signal lands where it matters.

Also verify the shell itself: native traffic lights close/minimize/zoom; ⌘C/⌘V
work in the terminal and editor; the menu bar shows App/Edit/Actions/Window; the
Actions items open the palette, focus the composer, and toggle YOLO.

## Windows

Everything Windows-specific is layered on this same tree; nothing above changes
for macOS or Linux.

### Build

```bash
npm ci --prefix ../frontend
npm ci
npm run tauri -- build --bundles nsis,msi   # Windows host only
# -> src-tauri/target/release/bundle/nsis/NIL_x.y.z_x64-setup.exe
# -> src-tauri/target/release/bundle/msi/NIL_x.y.z_x64_en-US.msi
```

Prerequisites: Rust stable (MSVC toolchain), Visual Studio Build Tools with the
Desktop C++ workload, WebView2 Runtime (preinstalled on Windows 11 / Windows 10
20H2+). WiX and NSIS are downloaded by the Tauri CLI on first `tauri build`.

### What the shell does on Windows, and why

Tauri merges `tauri.windows.conf.json` over `tauri.conf.json` only when the target
is Windows (arrays such as `app.windows` are replaced, so the main window is
restated there in full).

| Concern | Where | Grounding |
|---|---|---|
| Frameless window | overlay → `decorations: false`, `shadow: true` | `titleBarStyle: Overlay` is macOS-only; on Windows `decorations: true` would stack a native title bar on top of `Titlebar.svelte`. Frameless keeps the in-app titlebar as the single chrome (FRAMEWORK.md §3). `shadow: true` gives the Windows 11 rounded corners. |
| Dark theme | overlay → `theme: "Dark"` | `frontend/src/app.html` declares `color-scheme: dark`; `tokens.css` has no light set. Forcing Dark makes WebView2's `prefers-color-scheme`, native scrollbars and form controls agree with the UI regardless of the OS setting. |
| No white flash | overlay → `backgroundColor: "#0a0908"` | `--nil-void` from `tokens.css`. WebView2 paints white until the first frame otherwise. |
| DPI | `windows-app-manifest.xml` via `build.rs` | Declares PerMonitorV2 before any HWND or WebView2 init; tao's runtime `SetProcessDpiAwarenessContext` remains as the fallback. |
| Window controls / drag | `src/windows.rs` + `src/chrome_bridge.js` + `capabilities/windows-chrome.json` | With no native frame, `Titlebar.svelte` / `WindowControls.svelte` are the only controls. They call `__TAURI__.appWindow.*` and `__TAURI__.window.current().dragMove()`, which Tauri 2 does not expose; the bridge maps both onto `getCurrentWindow()`. The overlay sets `create: false` so `windows.rs` can create the window with the bridge as an initialization script. |
| No native menu | `main.rs` (`cfg(not(windows))` around `.menu`) | A Win32 menu bar renders as a light classic strip above a frameless window. The three Actions stay reachable through the in-webview keymap (⌘/Ctrl K, J, Y). |
| No console window | `main.rs` `windows_subsystem = "windows"` (release) | Standard Tauri. |
| WebView2 install | overlay → `webviewInstallMode: embedBootstrapper` | Installer bootstraps the runtime if missing (`docs/WELCOME.md`: "WebView2 is installed if missing"). |

Nothing here adds color, type, or motion; every value traces to `tokens.css`,
`app.html`, or `FRAMEWORK.md`.

### Installers

- **NSIS** (`Finn-Setup.exe` in CI artifacts, per `install/catalog.json`) —
  `installMode: currentUser`: installs to `%LOCALAPPDATA%\NIL`, HKCU registry, no
  UAC. This is the "normal user, not Administrator" path from `docs/WELCOME.md`.
- The installed executable is `nil-desktop.exe` (Tauri ships the main binary under
  its Cargo crate name); the Start Menu / desktop shortcut and Apps & Features
  entry are named `NIL`.
- **MSI** (`Finn-Setup.msi`) — WiX, per-machine to `%ProgramFiles%\NIL`. The upgrade
  code is pinned to the value Tauri derives from the product name
  (`npm run tauri -- inspect wix-upgrade-code`), so a later product rename cannot
  orphan installs.
- **Publisher / Manufacturer** is derived by Tauri from the identifier
  (`dev.nil.workstation` → `nil`) because `bundle.publisher` is unset. It shows in
  Apps & Features and names the `HKCU\Software\nil\NIL` key. Setting
  `bundle.publisher` is a product-naming decision for the base tree.
- **Cross-installer note (Tauri behaviour, observed in CI):** both installers record
  their install dir under `HKCU\Software\<publisher>\NIL`, and the MSI seeds
  `INSTALLDIR` from that key. If the NSIS build was installed first on the same
  account (even if since uninstalled — the key survives), the MSI silently installs
  into `%LOCALAPPDATA%\NIL` instead of Program Files. Delete that key between the two
  when testing both on one machine; the CI smoke does.
- **MSIX** — not produced. Tauri 2 has no MSIX bundler; Store/MSIX packaging would be
  a separate `makeappx` step over the NSIS payload.
- Both installers are unsigned. SmartScreen shows "Windows protected your PC" on
  first run of a downloaded build; `More info → Run anyway` is expected until a
  code-signing certificate is wired into `bundle.windows.certificateThumbprint` /
  `signCommand`.

### CI: `.github/workflows/windows-desktop.yml`

On `windows-latest`: `detect` → `npm ci` (frontend + desktop) → `tauri build
--bundles nsis,msi` → upload `Finn-Setup.exe` / `Finn-Setup.msi` as
`NIL-Windows-<sha>` (uploaded **before** the smoke so QA gets binaries even when a
phase fails) → `scripts/windows-smoke.ps1`, one phase per step with its own timeout:

- `launch`: logs the WebView2 runtime version, launches the unpackaged
  `nil-desktop.exe` (installers ship the binary under its crate name too),
  requires it to stay alive and own a top-level window for 12 s;
- `nsis`: asserts the installer exists and is > 1 MB, silent install (`/S`),
  launches the installed exe, silent uninstall, asserts removal;
- `msi`: same round-trip via `msiexec /i … /qn` and `/x`, after clearing the HKCU
  install-dir key. Every external wait has a hard timeout; failures print a process
  snapshot and the verbose MSI log.

That proves the shell links, WebView2 initializes, the frameless window is created,
and both installers lay down and remove files. It proves nothing visual.

### Still needs a person on a real Windows session

Run against the `NIL-Windows-<sha>` artifact, ideally on both a 100 % and a
150 %/200 % display:

1. **Launch and first paint.** No white flash before the well (`--nil-void`)
   appears; window opens centered at 1400×900 (or clamped to the work area) with
   rounded corners and a shadow on Windows 11, square on Windows 10; no native title
   bar, no menu strip, no console window.
2. **Window chrome.** Dragging the titlebar moves the window; the three
   `WindowControls` buttons minimize / toggle-maximize / close; the maximize glyph
   flips when the window is maximized by other means (Win+Up). Double-click on the
   titlebar is *not* expected to maximize (the chrome does not call `toggleMaximize`
   on dblclick).
3. **DPI and theme.** Move the window between monitors with different scale
   factors: text stays crisp, the window resizes proportionally, no blurry frame.
   With Windows in Light mode the app still renders dark and native scrollbars in
   the stream/terminal are dark.

Windows-specific gaps beyond the shared list below: the `chrome_bridge.js` layer
should be retired once `WindowControls.svelte` / `Titlebar.svelte` import
`getCurrentWindow` from `@tauri-apps/api/window` (and `frontend/src/types/tauri.d.ts`
stops declaring ambient `@tauri-apps/api/*` modules); `install/windows/launch.cmd`
still looks for `Finn Pentest Harness.exe` rather than `nil-desktop.exe`; the PTY gap below
means ConPTY on Windows.

## Known gaps / follow-ups for the platform + frontend teams

- **Notarization credentials + a Mac runner.** CI packages on `macos-latest` with
  ad-hoc signing. Real notarization needs the Apple secrets above.
- **PTY terminal backend.** `TerminalTab.svelte` calls
  `invoke('pty_connect', { socketPath })` and expects a WebSocket port. No
  `pty_connect` command is registered yet, so the terminal shows "disconnected"
  (honestly — it is not faked). Wiring a real PTY sidecar (see
  `.cursor/skills/nil-tauri/SKILL.md`) is the next runtime feature; it must
  implement that exact contract.
- **Titlebar inset for traffic lights (frontend).** With `Overlay`, the native
  traffic lights sit top-left. `Titlebar.svelte` draws the "nil" brand there and
  `WindowControls.svelte` still renders CSS controls on the right (dead under
  Overlay). The frontend should add a left inset and set the
  `.tauri-titlebar-overlay` class on macOS to hide the redundant CSS controls.
  Left as-is here to avoid touching product chrome.
- **CSP.** `app.security.csp` is `null` for a guaranteed-working webview. Tighten
  it (allow `'unsafe-eval'`/`blob:` for Monaco, `ws://127.0.0.1:*` for the PTY,
  `http://127.0.0.1:*` for the API) and verify on a Mac before enabling.
- **Updater.** The `nil-tauri` skill sketches an updater against `releases.nil.dev`
  with a placeholder key. Omitted here; enable it once there is a real endpoint
  and signing key.
