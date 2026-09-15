#!/usr/bin/env bash
# Assemble the shippable macOS installers from the Tauri build output.
#
# Expects `tauri build --bundles app,dmg` to have already produced the
# workstation app (NIL.app) under desktop/src-tauri/target/release/bundle/macos.
# This script adds the double-click "Finn Setup" wizard layer that install/macos
# already implements, and packages everything into the artifacts CI uploads:
#   - Finn-Setup.pkg  (Apple Installer document)
#   - Finn-Setup.dmg  (setup wizard + workstation app + Gatekeeper helper)
#   - Finn-Pentest-Harness-macOS-kit.zip  (drag-and-drop kit)
set -euo pipefail

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "macos-zip-app.sh is macOS-only (needs pkgbuild/productbuild/hdiutil); skipping." >&2
  exit 0
fi

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BUNDLE_DIR="${ROOT}/desktop/src-tauri/target/release/bundle/macos"
KIT="${BUNDLE_DIR}/Finn-Pentest-Harness-macOS-kit"

APP="$(find "$BUNDLE_DIR" -maxdepth 1 -name '*.app' ! -name '*Setup*' -print 2>/dev/null | head -1 || true)"
if [[ -z "$APP" || ! -d "$APP" ]]; then
  echo "FAIL: workstation .app not found in ${BUNDLE_DIR}. Run 'tauri build --bundles app' first." >&2
  exit 1
fi
APP_NAME="$(basename "$APP")"
echo "Workstation app: $APP"

# Apple Silicon refuses unsigned Mach-O; ad-hoc sign with the hardened-runtime
# entitlements so the app runs after the quarantine flag is cleared.
bash "${ROOT}/install/macos/adhoc-sign.sh" "$APP"

# Build the drag-and-drop kit: the GUI setup wizard + the workstation app + the
# Gatekeeper repair helper + the human-readable install notes.
rm -rf "$KIT"
mkdir -p "$KIT"
bash "${ROOT}/install/macos/make-app.sh" "${KIT}/Finn Setup.app"
ditto "$APP" "${KIT}/${APP_NAME}"
cp "${ROOT}/install/macos/fix-gatekeeper.command" "${KIT}/"
cp "${ROOT}/install/macos/install.txt" "${KIT}/"
chmod +x "${KIT}/fix-gatekeeper.command"
bash "${ROOT}/install/macos/adhoc-sign.sh" "${KIT}/Finn Setup.app" "${KIT}/${APP_NAME}"

# Flatten kit -> zip
( cd "$BUNDLE_DIR" && rm -f "Finn-Pentest-Harness-macOS-kit.zip" \
    && ditto -c -k --sequesterRsrc --keepParent \
       "Finn-Pentest-Harness-macOS-kit" "Finn-Pentest-Harness-macOS-kit.zip" )

# Apple Installer .pkg (finds the workstation app in BUNDLE_DIR).
bash "${ROOT}/install/macos/make-pkg.sh" "$BUNDLE_DIR"

# Setup DMG (uses the kit's "Finn Setup.app" as its payload).
bash "${ROOT}/install/macos/make-dmg.sh"

echo "== Installers =="
ls -lah "${BUNDLE_DIR}/Finn-Setup.pkg" "${BUNDLE_DIR}/Finn-Setup.dmg" \
        "${BUNDLE_DIR}/Finn-Pentest-Harness-macOS-kit.zip" 2>/dev/null || true
