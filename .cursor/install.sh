#!/usr/bin/env bash
# Idempotent dev-environment bootstrap for the NIL / Finn pentest workstation.
# Cursor runs this from the repository root after checking out the source.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

# Backend — Python 3.11+ FastAPI API, Typer CLI, and Textual TUI.
# Editable install with the dev extras (pytest, pytest-asyncio) into the user site.
pip install --user -e '.[dev]'

# Frontend — SvelteKit (Svelte 5) static workstation.
cd frontend
npm ci
# Generate .svelte-kit (types + tsconfig) so `npm run check` and the editor resolve
# $lib/$app immediately and the dev server has less to do on its first request.
npx svelte-kit sync
