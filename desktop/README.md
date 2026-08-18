# Finn desktop (Tauri 2)

Wraps `web/` and talks to the FastAPI backend on `http://127.0.0.1:8766`.

```bash
cd desktop
npm run setup        # npm install for web/ and desktop/
npm run tauri dev
```

On Windows, if you see `'vite' is not recognized`, the web frontend deps are missing. Run `npm run setup` from `desktop/` (or `npm install` in `web/`) once, then `npm run tauri dev` again.

---

## macOS

Requires macOS 12+ and Xcode command-line tools.

### First-time permissions

The very first launch may show Gatekeeper. Right-click the `.app` → **Open**, or run `xattr -cr "Finn Pentest Harness.app"`.

| Permission | Why Finn asks | Required? |
|------------|---------------|-----------|
| **Accessibility** | Global shortcut `Cmd+Shift+F` to summon Finn from anywhere | No — shortcut silently fails, app still works |
| **Local Network** | Connect to the Finn FastAPI backend on `127.0.0.1:8766` | Yes for scans / tools |
| **Files & Folders** | Read pentest scripts/configs, write reports to `~/finn` | Yes for reports / exports |
| **USB** | Optional packet-capture / SDR tooling | No — denied silently if unavailable |

Grant permissions in **System Settings → Privacy & Security**. The tray menu **Permissions…** opens that pane directly.

### No-sudo policy

Finn refuses to run as root and refuses commands prefixed with `sudo` / `doas`. Only individual tool actions may be elevated, and only after you approve them in the tool gate. This is enforced in `src-tauri/src/lib.rs`:

- `running_as_root()` checks `getuid() == 0` on macOS/Linux and admin status on Windows.
- `check_sudo_policy(command)` returns an error if the command starts with `sudo` / `doas`.
- `explain_sudo_request(command)` returns a user-readable explanation for the approval dialog.

### Build locally

```bash
cd desktop
npm run build:macos:app
# output: src-tauri/target/release/bundle/macos/*.app
#         src-tauri/target/release/bundle/macos/Finn-Pentest-Harness-macOS.zip

npm run tauri build -- --bundles app,dmg
# also writes src-tauri/target/release/bundle/dmg/*.dmg
```

`npm run build:macos:app` builds **only** the `.app` and zips it (`ditto -c -k --keepParent` so the bundle stays a real Mac application). Unzip on a Mac, then drag the `.app` to `/Applications`.

The default config uses ad-hoc signing (`signingIdentity: "-"`) so builds work without an Apple Developer certificate.

### Production signing + notarization

```bash
export APPLE_ID=you@example.com
export APPLE_ID_PASSWORD=app-specific-password
export TEAM_ID=XXXXXXXXXX
export SIGNING_IDENTITY="Developer ID Application: Your Name (TEAM_ID)"
desktop/scripts/macos-build.sh
desktop/scripts/macos-notarize.sh
```

This re-signs with a Developer ID, notarizes the DMG, and staples the ticket.

### Launch smoke test

```bash
desktop/scripts/macos-launch-smoke.sh
```

Runs the built `.app` for 12 seconds and verifies it stays up with no panics.

---

## Windows

Requires Windows 10+ and the **Microsoft Edge WebView2 Runtime**. If missing, the installer bundle will prompt to install it.

Build:

```bash
cd desktop
npm run tauri build
```

Output:
- `src-tauri/target/release/bundle/msi/*.msi`
- `src-tauri/target/release/bundle/nsis/*.exe`

The same no-sudo policy applies: Finn blocks commands prefixed with `sudo` / `doas` and warns if launched as Administrator.

---

## Linux

Build:

```bash
cd desktop
npm run tauri build
```

Output:
- `src-tauri/target/release/bundle/deb/*.deb`
- `src-tauri/target/release/bundle/rpm/*.rpm`
- `src-tauri/target/release/bundle/appimage/*.AppImage`

---

## Backend status

At launch Finn pings `http://127.0.0.1:8766/health`. If the backend is offline, a dialog explains that the shell still works but scans/tools are unavailable. The tray icon refreshes every 10 seconds and shows **Backend: online/offline**.

Start the backend before opening the app, or let the desktop shell spawn it:

```bash
finn api
```

---

## Troubleshooting

### `PluginInitialization("notification", ... expected unit)`

`desktop/src-tauri/tauri.conf.json` must **not** contain a `"plugins"` key. Tauri 2 deserializes plugin configs as unit (`()`), and empty objects `{}` panic. Shortcuts are registered in Rust (`src/lib.rs`).

### Global shortcut doesn't work on macOS

Go to **System Settings → Privacy & Security → Accessibility** and add `Finn Pentest Harness.app`. Without it, `Cmd+Shift+F` is ignored but the app still launches.

### `cargo tauri build` fails with missing libraries on Linux

Install the Tauri Linux prerequisites:

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev
```

---

## GitHub Actions

`.github/workflows/macos-desktop.yml` packages the app on `macos-latest` and runs `desktop/scripts/macos-launch-smoke.sh` until the process stays up.
