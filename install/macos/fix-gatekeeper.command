#!/bin/bash
# Double-click this if macOS says Finn “cannot be opened” or is “damaged”.
# That is Gatekeeper quarantine (and a missing ad-hoc signature), not a corrupt file.
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"

sign_app() {
  local app="$1"
  [[ -d "$app" && "$app" == *.app ]] || return 0
  if command -v xattr >/dev/null 2>&1; then
    xattr -cr "$app" 2>/dev/null || true
  fi
  if command -v codesign >/dev/null 2>&1; then
    local ent="${app}/Contents/Resources/Entitlements.plist"
    if [[ -f "$ent" ]]; then
      codesign --force --deep --sign - --entitlements "$ent" "$app" 2>/dev/null || true
    else
      codesign --force --deep --sign - "$app" 2>/dev/null || true
    fi
  fi
}

if command -v xattr >/dev/null 2>&1; then
  xattr -cr "$DIR" 2>/dev/null || true
  find "$DIR" -maxdepth 4 \( -name '*.app' -o -name '*.pkg' -o -name '*.dmg' -o -name '*.command' -o -name '*.zip' \) -print0 2>/dev/null \
    | while IFS= read -r -d '' p; do
        xattr -cr "$p" 2>/dev/null || true
      done
else
  osascript -e 'display alert "Finn Setup" message "Could not find xattr. In Terminal run: xattr -cr on this folder, then Right-click the app → Open."' || true
fi

find "$DIR" -maxdepth 4 -name '*.app' -print0 2>/dev/null \
  | while IFS= read -r -d '' app; do
      sign_app "$app"
    done

sign_app "/Applications/Finn Pentest Harness.app"
sign_app "${HOME}/Applications/Finn Pentest Harness.app"
sign_app "${DIR}/Finn Setup.app"
sign_app "${DIR}/Finn Pentest Harness.app"

if [[ -d "${DIR}/Finn Setup.app" ]]; then
  open "${DIR}/Finn Setup.app"
elif [[ -f "${DIR}/Finn-Setup.pkg" ]]; then
  open "${DIR}/Finn-Setup.pkg"
elif [[ -d "${DIR}/Finn Pentest Harness.app" ]]; then
  open "${DIR}/Finn Pentest Harness.app"
elif [[ -d "/Applications/Finn Pentest Harness.app" ]]; then
  open "/Applications/Finn Pentest Harness.app"
else
  osascript -e 'display alert "Finn Setup" message "Quarantine cleared and the app was re-signed. Open Finn-Setup.pkg or Finn Pentest Harness now. If macOS still blocks it, Right-click → Open."' || true
fi
