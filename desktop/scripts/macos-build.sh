#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DESKTOP="${ROOT}/desktop"
BUILD_DIR="${DESKTOP}/src-tauri/target/release/bundle"

# Default to app + DMG; override with FINN_BUNDLE_BUILDS=dmg,app,tar.gz
BUNDLES="${FINN_BUNDLE_BUILDS:-app,dmg}"

echo "==> Finn macOS build"
echo "    root: ${ROOT}"
echo "    bundles: ${BUNDLES}"
echo "    signing: ad-hoc (signingIdentity: -)"

cd "${DESKTOP}"
npm ci

# Tauri 2 requires the build to be run from the src-tauri directory on macOS
cd "${DESKTOP}/src-tauri"
cargo install tauri-cli --version "^2.0" --locked 2>/dev/null || true

cargo tauri build --bundles "${BUNDLES}"

APP="$(find "${BUILD_DIR}/macos" -maxdepth 1 -name '*.app' -print | head -n 1 || true)"
if [[ -z "${APP}" ]]; then
  echo "No .app produced in ${BUILD_DIR}/macos" >&2
  exit 1
fi

echo "==> Re-signing app bundle"
xattr -cr "${APP}"
codesign --force --deep --sign - "${APP}"

echo "==> Verifying"
codesign -dv --verbose=2 "${APP}" || true
plutil -lint "${APP}/Contents/Info.plist"

echo ""
echo "Built: ${APP}"
echo "DMG:   $(find "${BUILD_DIR}/dmg" -maxdepth 1 -name '*.dmg' -print | head -n 1 || echo 'none')"
echo ""
echo "To test locally:"
echo "  open \"${APP}\""
echo ""
echo "Or run the smoke test:"
echo "  desktop/scripts/macos-launch-smoke.sh"
