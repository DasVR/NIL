# Finn desktop (Tauri 2)

Wraps `web/` and talks to the FastAPI backend on `http://127.0.0.1:8766`.

```bash
cd desktop
npm run setup        # npm install for web/ and desktop/
npm run tauri dev
```

On Windows, if you see `'vite' is not recognized`, the web frontend deps are missing. Run `npm run setup` from `desktop/` (or `npm install` in `web/`) once, then `npm run tauri dev` again.

## macOS

Requires macOS 12+ and Xcode command-line tools. The bundled app is ad-hoc signed (`signingIdentity: "-"`) so local and CI builds launch without an Apple Developer certificate. Gatekeeper may still prompt on first open of a downloaded `.app`; right-click → Open, or `xattr -cr "Finn Pentest Harness.app"`.

```bash
cd desktop
npm run tauri build -- --bundles app,dmg
# output: src-tauri/target/release/bundle/macos/*.app
#         src-tauri/target/release/bundle/dmg/*.dmg
```

`Info.plist` allows cleartext HTTP to `localhost` / `127.0.0.1` so the UI can reach `finn api`. Global shortcut registration is best-effort: macOS blocks it without Accessibility permission, and that must not prevent launch.

GitHub Actions workflow `.github/workflows/macos-desktop.yml` packages the app on `macos-latest` and runs `desktop/scripts/macos-launch-smoke.sh` until the process stays up.

## Windows: `PluginInitialization("notification", ... expected unit)`

`desktop/src-tauri/tauri.conf.json` must **not** contain a `"plugins"` key.

Delete this if you still have it:

```json
  "plugins": {
    "notification": {},
    "global-shortcut": {}
  }
```

Tauri 2 deserializes those plugin configs as unit (`()`). An empty object `{}` is a map, so the app panics before the window opens. Shortcuts are registered in `src-tauri/src/lib.rs`.
