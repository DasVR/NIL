# Finn Pentest Harness

A local pentest **workstation**. Engagements are Spaces. The terminal is home. Finn sits beside the shell — it is not the homepage.

Use this only against systems you are authorized to test.

The desktop app, the site at `/app`, and the TUI share one FastAPI backend on `http://127.0.0.1:8766`.

## Install

Three eras: **Install** → **Welcome** (first Space) → **Workstation**. Per-OS notes: [`docs/WELCOME.md`](docs/WELCOME.md), files in [`install/catalog.json`](install/catalog.json).

Download **Finn-Setup** for your OS from [Releases](https://github.com/DasVR/finn-pentest-harness/releases) and double-click it. No Terminal. The API starts with the app.

| OS | File |
|---|---|
| macOS 12+ | `Finn-Setup.pkg` or `Finn-Setup.dmg` |
| Windows 10+ | `Finn-Setup.exe` |
| Linux x86_64 | `Finn-Setup.deb` or `Finn-Setup.AppImage` (`chmod +x`) |

Do **not** use the Python wheel zip as a Mac installer.

If macOS says **Finn Pentest Harness cannot be opened** (or is **damaged**), that is Gatekeeper quarantine on a GitHub download — Apple Silicon also refuses unsigned binaries. Double-click `fix-gatekeeper.command` next to the app, or run `xattr -cr` on the `.pkg` / `.app` / `.dmg`, then Right-click → Open.

Windows SmartScreen: More info → Run anyway. Open Finn from the Start Menu or desktop shortcut as a normal user.

Headless from a clone:

```bash
python3 install/wizard.py --cli --user --offline --host
# same as
bash install/unix/install.sh --user --offline --host
```

Windows:

```powershell
powershell -File install/windows/install.ps1 -Cli -User -Offline -HostSandbox
```

Full installer tree: [`install/README.md`](install/README.md).

Then open Finn. First Space is name + scope; the terminal starts with `scope loaded · N hosts · press ⌘K to scan`. In other terminals:

```bash
finn tui
# or
cd web && npm install && npm run dev   # http://127.0.0.1:5173
```

`/app` is the workstation. `/`, `/docs`, and `/download` do not need the API.

## Workstation

Terminal is the default surface. Finn is a column you summon (`⌘J`), never a chat landing page. Every shell command is a block with Approve / Edit / Reject. YOLO auto-runs and is still sandboxed and logged.

| Shortcut | Action |
|---|---|
| `⌘K` | Command palette |
| `⌘J` | Toggle Finn |
| `⌘↵` | Approve pending command |
| `⌘⇧↵` | Reject pending |
| `⌘Y` | YOLO |
| `⌘T` / `⌘E` / `⌘\` | Terminal / Artifact / Split |
| `⌘,` | Settings |
| `Esc` | Peel one layer |

Type English in Finn. Type real commands in `$`. Palette `? how do I…` hands the question to Finn.

## Desktop from source

```bash
cd desktop
npm run setup          # web/ + desktop/ npm deps
npm run tauri dev      # Rust + Tauri system deps
```

If Windows says `'vite' is not recognized`, run `npm install` inside `web/` first.

The Tauri app launches `/app`, starts the bundled API, and adds a tray icon plus `Ctrl+Shift+F` (macOS: `⌘⇧F`) to focus. Linux needs GTK/WebKit (`libgtk-3-dev`, `libwebkit2gtk-4.1-dev`) and Rust 1.85+. Windows needs WebView2. macOS 12+ uses system WebKit.

Prefer `git clone` / `git pull origin master` over a stale GitHub source zip.

## Layout

| Path | What |
|---|---|
| `finn_pentest/` | FastAPI, sandbox, plugins, AI router, TUI, CLI |
| `install/` | Setup wizard, OS catalog, engine — see `install/README.md` and `docs/WELCOME.md` |
| `web/` | SvelteKit (marketing + `/app`) |
| `desktop/` | Tauri 2 wrapper |
| `prompts/` | Assessment system prompts |
| `tests/` | pytest |
| `UX_REDESIGN.md` | Living UI spec |
| `docs/WELCOME.md` | Install + welcome + per-OS first launch |
| `cursor-research/` | Bookmarks research (polish input; the living spec wins) |

## Recon plugins

Authorized testing only. Shipped scanners, in hunt order:

`nmap` → `httpx` → `whatweb` → `sslscan` → `nuclei` → `nikto` → `ffuf` / `gobuster` · `subfinder` on domains.

They appear in the sidebar and palette. No extra routes.

Default runtime is a **host sandbox** (per-Space folder). Docker is opt-in after accepting sandbox terms.

## Providers

`~/.finn-pentest/providers.json` is created on first `finn api`. Set any of:

- `DEEPSEEK_API_KEY`
- `XAI_API_KEY`
- `MOONSHOT_API_KEY`
- `OLLAMA_API_KEY`

Empty keys are skipped. Failover is silent on 429 / 5xx / timeout. Edit providers from Settings (`⌘,`).

## Tests

```bash
python3 -m pytest tests -q
cd web && npm run check && npm run build
```

Docker sandbox tests skip when the daemon is missing.

## Releases

Tagged builds publish to [GitHub Releases](https://github.com/DasVR/finn-pentest-harness/releases):

```bash
git tag v1.1.1
git push origin v1.1.1
```

The **Release** workflow builds macOS, Windows, and Linux installers plus a Python wheel. `/download` reads the latest GitHub release.

## Safety

- Approval gate is on by default
- YOLO is per-engagement, still sandboxed and logged
- Code mode writes assessment scripts and parsers, not exploit kits
- Recon and assessment only — no exploit kits, C2, or credential stuffing
