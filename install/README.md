# Finn Setup

Double-click **Finn-Setup** for your OS. No Terminal. The API starts with the app.

| OS | File | What happens |
|---|---|---|
| macOS | `Finn-Setup.pkg` or `Finn-Setup.dmg` | Apple Installer or Finn Setup.app |
| Windows | `Finn-Setup.exe` | NSIS wizard, Start Menu + desktop shortcut |
| Linux | `Finn-Setup.deb` or `.AppImage` | Software Center / mark executable |

Do **not** use the Python wheel zip as a Mac installer.

If macOS says the app **cannot be opened** or is **damaged**, that is Gatekeeper quarantine on a GitHub file (Apple Silicon also refuses unsigned binaries). Double-click `fix-gatekeeper.command` next to the app, or run `xattr -cr` on the `.pkg` / `.app` / `.dmg`, then Right-click → Open.

## Layout

```
install/
  README.md          this file
  engine.py          shared install engine (no Python urllib — curl only)
  palette.py         locked abyss/green tokens (matches web/src/app.css)
  wizard.py          progress-bar Setup (Tk GUI + --cli)
  run-api.py         bundled API launcher
  unix/install.sh    headless CLI → wizard.py --cli
  windows/
    setup.cmd        double-click → wizard.py
    install.ps1      PowerShell CLI
    launch.cmd       find and start the workstation
  macos/
    make-app.sh      Finn Setup.app
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
