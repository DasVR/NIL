#!/usr/bin/env bash
# macos-notarize.sh — Optional notarization/stapling for a Developer-ID-signed build.
# Ad-hoc signing (no Apple cert) is enough for local use; this script is only for
# distributing a signed, notarized DMG.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BUILD_DIR="${ROOT}/desktop/src-tauri/target/release/bundle"

APPLE_ID="${APPLE_ID:?APPLE_ID env var required}"
APPLE_ID_PASSWORD="${APPLE_ID_PASSWORD:?APPLE_ID_PASSWORD env var required (app-specific password)}"
TEAM_ID="${TEAM_ID:?TEAM_ID env var required}"
SIGNING_IDENTITY="${SIGNING_IDENTITY:?SIGNING_IDENTITY env var required (e.g. 'Developer ID Application: Finn Labs (TEAMID)')}"

APP="$(find "${BUILD_DIR}/macos" -maxdepth 1 -name '*.app' -print | head -n 1 || true)"
DMG="$(find "${BUILD_DIR}/dmg" -maxdepth 1 -name '*.dmg' -print | head -n 1 || true)"
if [[ -z "${APP}" || -z "${DMG}" ]]; then
  echo "Run scripts/macos-build.sh first" >&2
  exit 1
fi

echo "==> Finn macOS notarization"
echo "    app: ${APP}"
echo "    dmg: ${DMG}"

echo "==> Signing with Developer ID"
codesign --force --options runtime --deep --sign "${SIGNING_IDENTITY}" "${APP}"
codesign -dv --verbose=2 "${APP}"

echo "==> Notarizing DMG"
xcrun notarytool submit "${DMG}" \
  --apple-id "${APPLE_ID}" \
  --password "${APPLE_ID_PASSWORD}" \
  --team-id "${TEAM_ID}" \
  --wait

echo "==> Stapling"
xcrun stapler staple "${DMG}"
xcrun stapler staple "${APP}"

echo ""
echo "Notarized and stapled:"
echo "  ${DMG}"
echo "  ${APP}"
