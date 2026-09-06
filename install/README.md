# Finn Setup

Three eras: **Install** (this folder) → **Welcome** (first open) → **Workstation**.
Living spec: [`docs/WELCOME.md`](../docs/WELCOME.md). OS files: [`catalog.json`](./catalog.json).

Double-click **Finn-Setup** for your OS. No Terminal. The API starts with the app.

| OS | File | What happens |
|---|---|---|
| macOS 12+ | `Finn-Setup.pkg` or `Finn-Setup.dmg` | Apple Installer or Finn Setup.app. User copy can live in `~/Applications`. |
| Windows 10+ | `Finn-Setup.exe` | NSIS wizard, Start Menu + desktop shortcut named Finn. WebView2 if needed. |
| Linux x86_64 | `Finn-Setup.deb` or `.AppImage` | Software Center / `chmod +x` the AppImage. `.rpm` also ships. |

Do **not** use the Python wheel zip as a Mac installer.

If macOS says the app **cannot be opened** or is **damaged**, that is Gatekeeper quarantine on a GitHub file (Apple Silicon also refuses unsigned binaries). Double-click `fix-gatekeeper.command` next to the app, or run `xattr -cr` on the `.pkg` / `.app` / `.dmg`, then Right-click → Open.

Windows SmartScreen on a GitHub download: More info → Run anyway. Launch as a normal user, not Administrator.

## Layout

```
install/
  README.md          this file
  catalog.json       per-OS files, paths, first-launch notes
  catalog.py         loader for wizard.py + tests
  engine.py          shared install engine (no Python urllib — curl only)
  palette.py         locked NIL tokens (matches frontend/src/lib/styles/tokens.css)
  wizard.py          Welcome → Installing → Launch (Tk GUI + --cli)
  run-api.py         bundled API launcher
  unix/install.sh    headless CLI → wizard.py --cli
  windows/
    setup.cmd        double-click → wizard.py
    install.ps1      PowerShell CLI
    launch.cmd       find and start the workstation
  macos/
    make-app.sh      Finn Setup.app (bundles catalog.json)
    make-pkg.sh      Finn-Setup.pkg
    make-dmg.sh      Finn-Setup.dmg
    fix-gatekeeper.command
    install.txt
    setup-launcher.sh   Finn Setup.app executable
    adhoc-sign.sh
    strip-adhoc-signature.sh  (wrapper → adhoc-sign.sh)
    pkg-scripts/postinstall
```

## Headless

From a clone or unzipped kit:

```bash
python3 install/wizard.py --cli --user --offline --host
# same as
bash install/unix/install.sh --user --offline --host
```

Windows:

```powershell
powershell -File install/windows/install.ps1 -Cli -User -Offline -HostSandbox
```

Flags: `--user` / `--admin`, `--online` / `--offline`, `--host` / `--docker` (Docker needs `--accept-docker-tos` and admin).

The Tk wizard's first page is the **Welcome** era on disk: who installs, where files come from, how tools run. Opening the app afterward is not a second installer — it only names the first Space.
