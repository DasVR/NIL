#!/usr/bin/env bash
# Build Finn-Setup.pkg — double-click, Apple Installer.app, no Terminal.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BUNDLE_DIR="${ROOT}/desktop/src-tauri/target/release/bundle/macos"
OUT_DIR="${1:-$BUNDLE_DIR}"
APP="${2:-}"

if [[ -z "$APP" ]]; then
  APP="$(find "${BUNDLE_DIR}" -maxdepth 1 -name '*.app' ! -name '*Setup*' -print | head -n 1 || true)"
fi
if [[ -z "$APP" || ! -d "$APP" ]]; then
  echo "No workstation .app found" >&2
  exit 1
fi

STAGE="$(mktemp -d /tmp/finn-pkg-XXXX)"
cleanup() { rm -rf "$STAGE"; }
trap cleanup EXIT

mkdir -p "${STAGE}/root/Applications"
ditto "$APP" "${STAGE}/root/Applications/$(basename "$APP")"

SCRIPTS="${ROOT}/install/macos/pkg-scripts"
chmod +x "${SCRIPTS}/postinstall"

VERSION="$(python3 -c "import json; print(json.load(open('${ROOT}/desktop/src-tauri/tauri.conf.json'))['version'])" 2>/dev/null || echo "1.1.0")"
COMPONENT="${STAGE}/finn-component.pkg"
OUT="${OUT_DIR}/Finn-Setup.pkg"

pkgbuild \
  --root "${STAGE}/root" \
  --identifier ai.finn.pentest \
  --version "${VERSION}" \
  --install-location / \
  --scripts "${SCRIPTS}" \
  "${COMPONENT}"

# Flatten into a single Installer.app document.
productbuild \
  --package "${COMPONENT}" \
  --identifier ai.finn.pentest.product \
  --version "${VERSION}" \
  "${OUT}"

ls -lah "${OUT}"
echo "Double-click ${OUT} — Apple Installer, no Terminal."
