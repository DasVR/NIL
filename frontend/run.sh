#!/usr/bin/env bash
set -euo pipefail

# run.sh — start the NIL static frontend locally
# Usage: ./run.sh [port]
# Serves the pre-built build/ directory via python http.server
# so the app can be opened in a browser without Vite dev.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="${SCRIPT_DIR}/build"
PORT="${1:-3000}"

if [[ ! -d "${BUILD_DIR}" ]]; then
  echo "[NIL] build/ directory not found. Build first with:"
  echo "  cd frontend && npm install && npm run build"
  exit 1
fi

echo "[NIL] serving build/ on http://localhost:${PORT}"
python3 -m http.server "${PORT}" --directory "${BUILD_DIR}"
