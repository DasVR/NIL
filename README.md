# Finn Pentest Harness

Dual-interface, AI-driven pentest workstation. Terminal TUI, local website, and Tauri desktop app share one FastAPI backend on `http://127.0.0.1:8766`.

Use this only against systems you are authorized to test.

## Quick start

```bash
python3 -m pip install -e ".[dev]"
cp .env.example .env
finn api
```

In other terminals:

```bash
finn tui
# or
cd web && npm install && npm run dev   # http://127.0.0.1:5173
```

Open `/app` for the workstation. Landing, docs, and download pages are public and do not need the API.

### Desktop

```bash
cd web && npm install && npm run build
cd ../desktop && npm install
npm run tauri dev    # requires Rust + Tauri system deps
```

The desktop app wraps the same Svelte UI, launches into `/app`, and adds a tray icon plus `Ctrl+Shift+F` to focus. Linux builds need GTK/WebKit (`libgtk-3-dev`, `libwebkit2gtk-4.1-dev`) and Rust 1.85+.

## Layout

- `finn_pentest/` — FastAPI, sandbox, plugins, AI router, TUI, CLI
- `web/` — SvelteKit website (marketing + `/app`)
- `desktop/` — Tauri 2 wrapper
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

Sandbox tests that need Docker are skipped when the daemon is missing. Tool execution always targets the engagement container, never the host.

## Safety

- Approval gate is on by default
- YOLO is per-engagement, still sandboxed and logged
- Code mode writes assessment scripts and parsers, not exploit kits
- Recon plugins ship: nmap, nuclei, ffuf, gobuster
