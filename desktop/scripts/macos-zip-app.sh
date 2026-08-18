#!/usr/bin/env bash
# Zip the built Finn .app so it can be downloaded as a single file
# (GitHub Releases cannot attach a .app directory).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BUNDLE_DIR="${ROOT}/desktop/src-tauri/target/release/bundle/macos"
APP="$(find "${BUNDLE_DIR}" -maxdepth 1 -name '*.app' -print | head -n 1 || true)"

if [[ -z "${APP}" || ! -d "${APP}" ]]; then
  echo "No .app found under ${BUNDLE_DIR}" >&2
  exit 1
fi

OUT="${BUNDLE_DIR}/Finn-Pentest-Harness-macOS.zip"
rm -f "${OUT}"

echo "==> Zipping $(basename "${APP}") → ${OUT}"
if command -v ditto >/dev/null 2>&1; then
  # Preserves resource forks, Finder info, and bundle layout.
  ditto -c -k --keepParent "${APP}" "${OUT}"
else
  (
    cd "$(dirname "${APP}")"
    zip -r -y "${OUT}" "$(basename "${APP}")"
  )
fi

ls -lah "${OUT}"
echo "Unzip on a Mac, then drag $(basename "${APP}") to /Applications."
