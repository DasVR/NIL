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
  src-tauri/
    tauri.conf.json        # window chrome, bundle + macOS signing config
    Cargo.toml, build.rs
    src/main.rs            # native menu + event bridge to the UI
    Entitlements.plist     # Hardened Runtime exceptions (NOT App Sandbox)
    capabilities/default.json
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
