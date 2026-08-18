#!/usr/bin/env bash
# macOS kit: Finn Setup.app (double-click installer) + workstation .app + .dmg + API.
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
chmod +x "${ROOT}/install/macos/make-setup-app.sh" "${ROOT}/install/finn-setup.py" "${ROOT}/install/finn-install.sh"

KIT="${BUNDLE_DIR}/Finn-Pentest-Harness-macOS-kit"
rm -rf "${KIT}"
mkdir -p "${KIT}/api" "${KIT}/install"

cp -R "${APP}" "${KIT}/"
DMG="$(find "${DMG_DIR}" -maxdepth 1 -name '*.dmg' -print 2>/dev/null | head -n 1 || true)"
if [[ -n "${DMG}" && -f "${DMG}" ]]; then
  cp "${DMG}" "${KIT}/"
fi

cp -R "${ROOT}/desktop/src-tauri/resources/api/." "${KIT}/api/"
cp "${ROOT}/install/engine.py" "${KIT}/install/"
cp "${ROOT}/install/finn-setup.py" "${KIT}/install/"
cp "${ROOT}/install/finn-install.sh" "${KIT}/install/"
cp "${ROOT}/install/finn-install.ps1" "${KIT}/install/"
cp "${ROOT}/install/run-api.py" "${KIT}/install/"
cp "${ROOT}/install/run-api.py" "${KIT}/"
chmod +x "${KIT}/install/finn-install.sh" "${KIT}/install/finn-setup.py"

PAYLOAD="${KIT}/.setup-payload"
rm -rf "${PAYLOAD}"
mkdir -p "${PAYLOAD}"
cp -R "${KIT}/api/." "${PAYLOAD}/"
cp -R "${APP}" "${PAYLOAD}/"
bash "${ROOT}/install/macos/make-setup-app.sh" "${KIT}/Finn Setup.app" "${PAYLOAD}"
rm -rf "${PAYLOAD}"

chmod +x "${ROOT}/install/macos/make-pkg.sh" "${ROOT}/install/macos/make-setup-dmg.sh"
bash "${ROOT}/install/macos/make-pkg.sh" "${BUNDLE_DIR}" "${APP}"
bash "${ROOT}/install/macos/make-setup-dmg.sh" "${KIT}/Finn Setup.app"

cat > "${KIT}/INSTALL.txt" <<'EOF'
Finn Setup
==========

No Terminal needed.

1. Double-click Finn-Setup.pkg (Apple Installer, progress bar)
   or open Finn-Setup.dmg and double-click Finn Setup.app

2. Open Finn Pentest Harness from Applications. The API starts with the app.

User-only copy (no admin): double-click Finn Setup.app and choose User.
EOF

OUT="${BUNDLE_DIR}/Finn-Pentest-Harness-macOS.zip"
rm -f "${OUT}"

echo "==> Kit zip with Finn Setup.app → ${OUT}"
if command -v ditto >/dev/null 2>&1; then
  (cd "${KIT}" && ditto -c -k . "${OUT}")
else
  (cd "${KIT}" && zip -r -y "${OUT}" .)
fi

ls -lah "${OUT}"
echo "Unzip on a Mac and double-click Finn Setup.app"
