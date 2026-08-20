#!/usr/bin/env bash
# Clear quarantine and ad-hoc-sign macOS .app bundles.
#
# Unsigned Mach-O is rejected on Apple Silicon with “cannot be opened”.
# Ad-hoc signing lets the binary run. GitHub still sets com.apple.quarantine
# on download, so users (or postinstall / fix-gatekeeper.command) must also
# run xattr -cr — this script does that first.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ENTITLEMENTS="${FINN_ENTITLEMENTS:-${ROOT}/desktop/src-tauri/Entitlements.plist}"

sign_one() {
  local p="$1"
  [[ -e "$p" ]] || return 0
  if command -v xattr >/dev/null 2>&1; then
    xattr -cr "$p" 2>/dev/null || true
  fi
  if [[ "$(uname -s)" != "Darwin" ]]; then
    return 0
  fi
  if ! command -v codesign >/dev/null 2>&1; then
    return 0
  fi
  if [[ -d "$p" && "$p" == *.app ]]; then
    local ent="$ENTITLEMENTS"
    if [[ ! -f "$ent" ]]; then
      ent="${p}/Contents/Resources/Entitlements.plist"
    fi
    # Copy entitlements into the bundle so postinstall / fix-gatekeeper can re-sign.
    if [[ -f "$ent" ]]; then
      mkdir -p "${p}/Contents/Resources"
      if [[ "$ent" != "${p}/Contents/Resources/Entitlements.plist" ]]; then
        cp "$ent" "${p}/Contents/Resources/Entitlements.plist"
        ent="${p}/Contents/Resources/Entitlements.plist"
      fi
      codesign --force --deep --sign - --entitlements "$ent" "$p"
    else
      codesign --force --deep --sign - "$p"
    fi
  fi
}

if [[ $# -eq 0 ]]; then
  echo "usage: adhoc-sign.sh <path>..." >&2
  exit 1
fi

for arg in "$@"; do
  sign_one "$arg"
done
