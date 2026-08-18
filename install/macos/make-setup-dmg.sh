#!/usr/bin/env bash
# DMG whose only job is the installer: Finn Setup.app + Applications drop target.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BUNDLE_DIR="${ROOT}/desktop/src-tauri/target/release/bundle/macos"
DMG_OUT="${BUNDLE_DIR}/Finn-Setup.dmg"
SETUP="${1:-${BUNDLE_DIR}/Finn-Pentest-Harness-macOS-kit/Finn Setup.app}"

if [[ ! -d "$SETUP" ]]; then
  echo "Finn Setup.app not found at ${SETUP}" >&2
  exit 1
fi

STAGE="$(mktemp -d /tmp/finn-setup-dmg-XXXX)"
cleanup() { rm -rf "$STAGE"; }
trap cleanup EXIT

ditto "$SETUP" "${STAGE}/Finn Setup.app"
cp "${ROOT}/install/macos/Fix macOS Gatekeeper.command" "${STAGE}/"
cp "${ROOT}/install/macos/INSTALL.txt" "${STAGE}/"
chmod +x "${STAGE}/Fix macOS Gatekeeper.command"
ln -s /Applications "${STAGE}/Applications"
bash "${ROOT}/install/macos/strip-adhoc-signature.sh" "${STAGE}/Finn Setup.app"

VOL="Finn Setup"
rm -f "${DMG_OUT}"
hdiutil create \
  -volname "${VOL}" \
  -srcfolder "${STAGE}" \
  -ov \
  -format UDZO \
  "${DMG_OUT}"

ls -lah "${DMG_OUT}"
echo "Open ${DMG_OUT}, double-click Finn Setup.app (no Terminal)."
