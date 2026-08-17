#!/usr/bin/env bash
# macos-build.sh — Build the Finn macOS app and DMG with ad-hoc signing.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DESKTOP="${ROOT}/desktop"
BUILD_DIR="${DESKTOP}/src-tauri/target/release/bundle"

BUNDLES="${FINN_BUNDLE_BUILDS:-app,dmg}"

echo "==> Finn macOS build"
echo "    root: ${ROOT}"
echo "    bundles: ${BUNDLES}"
echo "    signing: ad-hoc (signingIdentity: -)"

cd "${DESKTOP}"
npm run setup

# Ensure cargo-tauri is available.
cargo install tauri-cli --version "^2.0" --locked 2>/dev/null || true

cd "${DESKTOP}/src-tauri"
cargo tauri build --bundles "${BUNDLES}"

APP="$(find "${BUILD_DIR}/macos" -maxdepth 1 -name '*.app' -print | head -n 1 || true)"
if [[ -z "${APP}" ]]; then
  echo "No .app produced in ${BUILD_DIR}/macos" >&2
  exit 1
fi

echo "==> Re-signing app bundle ad-hoc"
xattr -cr "${APP}" || true
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
echo "Or run the smoke test:"
echo "  desktop/scripts/macos-launch-smoke.sh"
