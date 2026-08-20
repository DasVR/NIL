#!/usr/bin/env bash
# Build a double-clickable Finn Setup.app (macOS analog of setup.exe).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="${1:-${ROOT}/dist/Finn Setup.app}"
PAYLOAD="${2:-}"

rm -rf "${OUT}"
MACOS="${OUT}/Contents/MacOS"
RES="${OUT}/Contents/Resources"
mkdir -p "${MACOS}" "${RES}/payload"

cp "${ROOT}/install/engine.py" "${RES}/"
cp "${ROOT}/install/palette.py" "${RES}/"
cp "${ROOT}/install/catalog.py" "${RES}/"
cp "${ROOT}/install/catalog.json" "${RES}/"
cp "${ROOT}/install/wizard.py" "${RES}/"
cp "${ROOT}/install/run-api.py" "${RES}/"
cp "${ROOT}/install/run-api.py" "${RES}/payload/"

if [[ -d "${ROOT}/finn_pentest" ]]; then
  cp -R "${ROOT}/finn_pentest" "${RES}/payload/finn_pentest"
  cp "${ROOT}/pyproject.toml" "${RES}/payload/" 2>/dev/null || true
  [[ -d "${ROOT}/prompts" ]] && cp -R "${ROOT}/prompts" "${RES}/payload/prompts"
fi

if [[ -n "${PAYLOAD}" && -d "${PAYLOAD}" ]]; then
  cp -R "${PAYLOAD}/." "${RES}/payload/"
fi

ICNS="${ROOT}/desktop/src-tauri/icons/icon.icns"
if [[ -f "${ICNS}" ]]; then
  cp "${ICNS}" "${RES}/icon.icns"
fi

cp "${ROOT}/install/macos/setup-launcher.sh" "${MACOS}/Finn Setup"
chmod +x "${MACOS}/Finn Setup"

cat > "${OUT}/Contents/Info.plist" <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleName</key><string>Finn Setup</string>
  <key>CFBundleDisplayName</key><string>Finn Setup</string>
  <key>CFBundleIdentifier</key><string>ai.finn.pentest.setup</string>
  <key>CFBundleVersion</key><string>1.1.1</string>
  <key>CFBundleShortVersionString</key><string>1.1.1</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>CFBundleExecutable</key><string>Finn Setup</string>
  <key>CFBundleIconFile</key><string>icon</string>
  <key>LSMinimumSystemVersion</key><string>12.0</string>
  <key>NSHighResolutionCapable</key><true/>
  <key>LSUIElement</key><false/>
</dict>
</plist>
EOF

echo "Built ${OUT}"
