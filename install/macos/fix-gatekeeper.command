#!/bin/bash
# Double-click this if macOS says Finn is "damaged and can't be opened".
# That message is Gatekeeper quarantine on a GitHub download, not a corrupt file.
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"

if ! command -v xattr >/dev/null 2>&1; then
  osascript -e 'display alert "Finn Setup" message "Could not find xattr. In Terminal run: xattr -cr on this folder."' || true
  exit 1
fi

xattr -cr "$DIR" 2>/dev/null || true
find "$DIR" -maxdepth 4 \( -name '*.app' -o -name '*.pkg' -o -name '*.dmg' -o -name '*.command' -o -name '*.zip' \) -print0 2>/dev/null \
  | while IFS= read -r -d '' p; do
      xattr -cr "$p" 2>/dev/null || true
    done

if [[ -d "${DIR}/Finn Setup.app" ]]; then
  open "${DIR}/Finn Setup.app"
elif [[ -f "${DIR}/Finn-Setup.pkg" ]]; then
  open "${DIR}/Finn-Setup.pkg"
elif [[ -d "${DIR}/Finn Pentest Harness.app" ]]; then
  open "${DIR}/Finn Pentest Harness.app"
else
  osascript -e 'display alert "Finn Setup" message "Quarantine flag cleared. Open Finn-Setup.pkg or Finn Setup.app now."' || true
fi
