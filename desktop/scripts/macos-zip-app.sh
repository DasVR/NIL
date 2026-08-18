#!/usr/bin/env bash
# Build a downloadable macOS kit: .app + .dmg + bundled API + one-file installer.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BUNDLE_DIR="${ROOT}/desktop/src-tauri/target/release/bundle/macos"
DMG_DIR="${ROOT}/desktop/src-tauri/target/release/bundle/dmg"
APP="$(find "${BUNDLE_DIR}" -maxdepth 1 -name '*.app' -print | head -n 1 || true)"

if [[ -z "${APP}" || ! -d "${APP}" ]]; then
  echo "No .app found under ${BUNDLE_DIR}" >&2
  exit 1
fi

node "${ROOT}/desktop/scripts/stage-api.mjs"

KIT="${BUNDLE_DIR}/Finn-Pentest-Harness-macOS-kit"
rm -rf "${KIT}"
mkdir -p "${KIT}/api" "${KIT}/install"

cp -R "${APP}" "${KIT}/"
DMG="$(find "${DMG_DIR}" -maxdepth 1 -name '*.dmg' -print 2>/dev/null | head -n 1 || true)"
if [[ -n "${DMG}" && -f "${DMG}" ]]; then
  cp "${DMG}" "${KIT}/"
fi

cp -R "${ROOT}/desktop/src-tauri/resources/api/." "${KIT}/api/"
cp "${ROOT}/install/finn-install.sh" "${KIT}/install/"
cp "${ROOT}/install/finn-install.ps1" "${KIT}/install/"
cp "${ROOT}/install/run-api.py" "${KIT}/install/"
cp "${ROOT}/install/run-api.py" "${KIT}/"
chmod +x "${KIT}/install/finn-install.sh" "${KIT}/run-api.py" "${KIT}/install/run-api.py"

cat > "${KIT}/INSTALL.txt" <<'EOF'
Finn macOS kit
==============

This zip includes the .app, the .dmg (when built), and the API.

1. Online user install (downloads matching GitHub assets if needed):
     bash install/finn-install.sh --user --online --host

2. Offline / air-gapped (uses files in this folder only):
     bash install/finn-install.sh --user --offline --host

3. Admin install (system paths, optional Docker sandbox):
     bash install/finn-install.sh --admin --online --docker --accept-docker-tos

Or drag the .app into Applications / open the .dmg. The desktop app starts
the API itself — do not run `finn api` separately.

Launch Finn as a normal user even after an admin install.
EOF

OUT="${BUNDLE_DIR}/Finn-Pentest-Harness-macOS.zip"
rm -f "${OUT}"

echo "==> Kit zip $(basename "${APP}") + API → ${OUT}"
if command -v ditto >/dev/null 2>&1; then
  (cd "${KIT}" && ditto -c -k . "${OUT}")
else
  (cd "${KIT}" && zip -r -y "${OUT}" .)
fi

ls -lah "${OUT}"
echo "Unzip on a Mac. Prefer install/finn-install.sh, or drag the .app to /Applications."
