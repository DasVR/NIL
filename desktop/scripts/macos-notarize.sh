#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DESKTOP="${ROOT}/desktop"
BUILD_DIR="${DESKTOP}/src-tauri/target/release/bundle"

APPLE_ID="${APPLE_ID:?APPLE_ID env var required}"
APPLE_ID_PASSWORD="${APPLE_ID_PASSWORD:?APPLE_ID_PASSWORD env var required}"
TEAM_ID="${TEAM_ID:?TEAM_ID env var required}"
SIGNING_IDENTITY="${SIGNING_IDENTITY:?SIGNING_IDENTITY env var required (e.g. 'Developer ID Application: ...')}"

APP="$(find "${BUILD_DIR}/macos" -maxdepth 1 -name '*.app' -print | head -n 1 || true)"
DMG="$(find "${BUILD_DIR}/dmg" -maxdepth 1 -name '*.dmg' -print | head -n 1 || true)"
if [[ -z "${APP}" || -z "${DMG}" ]]; then
  echo "Run scripts/macos-build.sh first" >&2
  exit 1
fi

echo "==> Finn macOS notarization"
echo "    app: ${APP}"
echo "    dmg: ${DMG}"

# Re-sign with Developer ID
echo "==> Signing with Developer ID"
codesign --force --options runtime --deep --sign "${SIGNING_IDENTITY}" "${APP}"
codesign -dv --verbose=2 "${APP}"

# Create a fresh signed DMG
echo "==> Re-packaging signed DMG"
rm -f "${DMG}"
cd "${BUILD_DIR}"
tauri signer sign --dmg "$(basename "${DMG}" .dmg)" || true

# Notarize the DMG
echo "==> Notarizing"
xcrun notarytool submit "${DMG}" \
  --apple-id "${APPLE_ID}" \
  --password "${APPLE_ID_PASSWORD}" \
  --team-id "${TEAM_ID}" \
  --wait

# Staple
echo "==> Stapling"
xcrun stapler staple "${DMG}"
xcrun stapler staple "${APP}"

echo ""
echo "Notarized and stapled:"
echo "  ${DMG}"
echo "  ${APP}"
