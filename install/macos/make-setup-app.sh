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
cp "${ROOT}/install/finn-setup.py" "${RES}/"
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

cat > "${MACOS}/Finn Setup" <<'EOF'
#!/bin/bash
set -euo pipefail
RES="$(cd "$(dirname "$0")/../Resources" && pwd)"
export FINN_SETUP_PAYLOAD="${RES}/payload"
export PYTHONPATH="${RES}:${PYTHONPATH:-}"
cd "${RES}"
PY=""
for c in python3.12 python3.13 python3.11 python3; do
  if command -v "$c" >/dev/null 2>&1; then
    PY="$c"
    break
  fi
done
if [[ -z "$PY" ]]; then
  osascript -e 'display alert "Finn Setup" message "Python 3.11+ is required. Install it from python.org or Homebrew, then open Finn Setup again."'
  exit 1
fi
if ! "$PY" -c "import tkinter" >/dev/null 2>&1; then
  osascript -e 'display alert "Finn Setup" message "This installer needs Tk. On Homebrew run: brew install python-tk. Or run: python3 install/finn-setup.py --cli --user --offline --host"'
  exec "$PY" "${RES}/finn-setup.py" --cli --user --offline --host
fi
exec "$PY" "${RES}/finn-setup.py"
EOF
chmod +x "${MACOS}/Finn Setup"

cat > "${OUT}/Contents/Info.plist" <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleName</key><string>Finn Setup</string>
  <key>CFBundleDisplayName</key><string>Finn Setup</string>
  <key>CFBundleIdentifier</key><string>ai.finn.pentest.setup</string>
  <key>CFBundleVersion</key><string>1.0.0</string>
  <key>CFBundleShortVersionString</key><string>1.0.0</string>
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
