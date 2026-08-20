#!/usr/bin/env bash
# macOS kit: Finn Setup.app (double-click installer) + workstation .app + .dmg + API.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BUNDLE_DIR="${ROOT}/desktop/src-tauri/target/release/bundle/macos"
DMG_DIR="${ROOT}/desktop/src-tauri/target/release/bundle/dmg"
APP="$(find "${BUNDLE_DIR}" -maxdepth 1 -name '*.app' ! -name '*Setup*' -print | head -n 1 || true)"

if [[ -z "${APP}" || ! -d "${APP}" ]]; then
  echo "No .app found under ${BUNDLE_DIR}" >&2
  exit 1
fi

node "${ROOT}/desktop/scripts/stage-api.mjs"
chmod +x "${ROOT}/install/macos/make-app.sh" "${ROOT}/install/macos/setup-launcher.sh" "${ROOT}/install/wizard.py" "${ROOT}/install/unix/install.sh"
chmod +x "${ROOT}/install/macos/adhoc-sign.sh" "${ROOT}/install/macos/strip-adhoc-signature.sh" "${ROOT}/install/macos/fix-gatekeeper.command"

# Apple Silicon rejects unsigned Mach-O ("cannot be opened"). Ad-hoc-sign, then xattr -cr.
bash "${ROOT}/install/macos/adhoc-sign.sh" "${APP}"

KIT="${BUNDLE_DIR}/Finn-Pentest-Harness-macOS-kit"
rm -rf "${KIT}"
mkdir -p "${KIT}/api"

cp -R "${APP}" "${KIT}/"
bash "${ROOT}/install/macos/adhoc-sign.sh" "${KIT}/$(basename "${APP}")"
DMG="$(find "${DMG_DIR}" -maxdepth 1 -name '*.dmg' -print 2>/dev/null | head -n 1 || true)"
if [[ -n "${DMG}" && -f "${DMG}" ]]; then
  cp "${DMG}" "${KIT}/"
fi

cp -R "${ROOT}/desktop/src-tauri/resources/api/." "${KIT}/api/"
cp -R "${ROOT}/install" "${KIT}/install"
cp "${ROOT}/install/run-api.py" "${KIT}/"
cp "${ROOT}/install/macos/fix-gatekeeper.command" "${KIT}/"
cp "${ROOT}/install/macos/install.txt" "${KIT}/"
chmod +x "${KIT}/install/unix/install.sh" "${KIT}/install/wizard.py" "${KIT}/fix-gatekeeper.command"

PAYLOAD="${KIT}/.setup-payload"
rm -rf "${PAYLOAD}"
mkdir -p "${PAYLOAD}"
cp -R "${KIT}/api/." "${PAYLOAD}/"
cp -R "${APP}" "${PAYLOAD}/"
bash "${ROOT}/install/macos/make-app.sh" "${KIT}/Finn Setup.app" "${PAYLOAD}"
rm -rf "${PAYLOAD}"
bash "${ROOT}/install/macos/adhoc-sign.sh" "${KIT}/Finn Setup.app"

chmod +x "${ROOT}/install/macos/make-pkg.sh" "${ROOT}/install/macos/make-dmg.sh"
bash "${ROOT}/install/macos/make-pkg.sh" "${BUNDLE_DIR}" "${APP}"
bash "${ROOT}/install/macos/make-dmg.sh" "${KIT}/Finn Setup.app"

OUT="${BUNDLE_DIR}/Finn-Pentest-Harness-macOS.zip"
rm -f "${OUT}"

echo "==> Kit zip with Finn Setup.app → ${OUT}"
if command -v ditto >/dev/null 2>&1; then
  (cd "${KIT}" && ditto -c -k . "${OUT}")
else
  (cd "${KIT}" && zip -r -y "${OUT}" .)
fi

ls -lah "${OUT}"
echo "Unzip on a Mac. If macOS says it cannot be opened, double-click fix-gatekeeper.command"
