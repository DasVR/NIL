# Finn Pentest Harness

Dual-interface, AI-driven pentest workstation. Terminal TUI, local website, and Tauri desktop app share one FastAPI backend on `http://127.0.0.1:8766`.

Use this only against systems you are authorized to test.

## Quick start

Download **Finn-Setup** for your OS and double-click it. No Terminal.

- **macOS:** `Finn-Setup.pkg` (Apple Installer) or `Finn-Setup.dmg` from the **Finn-Setup-macOS-*** artifact
- **Windows:** `Finn-Setup.exe` — double-click, then open **Finn** from the Start Menu or desktop. The API starts with the app (Python is bundled; you do not run a separate server).
- **Linux:** `Finn-Setup.deb` or the AppImage

Then open Finn. The API starts with the app. Do not use the python wheel zip (`finn-python-*`) as a Mac installer.

If macOS says the download is **damaged**, that is Gatekeeper quarantine on a GitHub file, not a corrupt archive. Double-click **Fix macOS Gatekeeper.command** next to the app, or run `xattr -cr` on the `.pkg` / `.app` / `.dmg`, then open it again. Right-click → Open also works for “unidentified developer”; it does not always clear the damaged message.

In other terminals:

```bash
finn tui
# or
cd web && npm install && npm run dev   # http://127.0.0.1:5173
```

Open `/app` for the workstation. Landing, docs, and download pages are public and do not need the API.

### Desktop

```bash
cd desktop
npm run setup          # installs web/ and desktop/ npm deps
npm run tauri dev      # requires Rust + Tauri system deps
```

If Windows says `'vite' is not recognized`, run `npm install` inside `web/` (or `npm run setup` from `desktop/`), then retry.

The desktop app wraps the same Svelte UI, launches into `/app`, and adds a tray icon plus `Ctrl+Shift+F` (macOS: `Cmd+Shift+F`) to focus. Linux builds need GTK/WebKit (`libgtk-3-dev`, `libwebkit2gtk-4.1-dev`) and Rust 1.85+. Windows needs WebView2 (bundled with Edge). macOS 12+ uses the system WebKit; GitHub Actions packages a zipped `.app` and a `.dmg`, and smoke-tests that the binary stays up after launch.

If `npm run tauri dev` panics with `PluginInitialization("notification", "... invalid type: map, expected unit")`, open `desktop/src-tauri/tauri.conf.json` and delete the entire `"plugins"` object. Do not leave `"notification": {}` or `"global-shortcut": {}` in that file — Tauri 2 treats those empty objects as invalid. Plugins are registered in `desktop/src-tauri/src/lib.rs`. Then rerun `npm run tauri dev`.

GitHub zip snapshots named `finn-pentest-harness-master` go stale. Prefer `git clone` / `git pull origin master` over reusing an old unzipped folder.

## Layout

- `finn_pentest/` — FastAPI, sandbox, plugins, AI router, TUI, CLI
- `install/` — one-file user/admin installers (`finn-install.sh`, `finn-install.ps1`) and `run-api.py`
- `web/` — SvelteKit website (marketing + `/app`)
- `desktop/` — Tauri 2 wrapper (bundles the API into the app)
- `prompts/` — professional assessment system prompts
- `tests/` — pytest

## Providers

Copy `~/.finn-pentest/providers.json` (created on first `finn api`) and set:

- `DEEPSEEK_API_KEY`
- `XAI_API_KEY`
- `MOONSHOT_API_KEY`
- `OLLAMA_API_KEY`

Empty keys are skipped. Failover is silent on 429 / 5xx / timeout.

## Tests

```bash
python3 -m pytest tests -q
```

Sandbox tests that need Docker are skipped when the daemon is missing. The default runtime is a **host sandbox** (per-Space folder, no Docker). Docker is opt-in after accepting sandbox terms.

## Releases

Tagged builds publish automatically to [GitHub Releases](https://github.com/DasVR/finn-pentest-harness/releases) (macOS kit zip of the `.app` + `.dmg` + API, Windows `.exe`, Linux `.AppImage` / `.deb`, plus a Python wheel):

```bash
git tag v1
git push origin v1
```

The **Release** workflow builds all three platforms and uploads installers. Run it with **macos_only** to skip Windows and Linux. The site `/download` page pulls the latest release from the GitHub API. Unzip the macOS kit and either run `install/finn-install.sh` or drag `Finn Pentest Harness.app` to Applications. The API is inside the app.

## Safety

- Approval gate is on by default
- YOLO is per-engagement, still sandboxed and logged
- Code mode writes assessment scripts and parsers, not exploit kits
- Recon plugins ship: nmap, nuclei, ffuf, gobuster
