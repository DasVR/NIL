#!/usr/bin/env bash
# Ad-hoc signatures + the com.apple.quarantine flag from a GitHub download
# make macOS say the app is "damaged". Strip both before we zip/pkg/dmg.
set -euo pipefail

strip_one() {
  local p="$1"
  [[ -e "$p" ]] || return 0
  if command -v xattr >/dev/null 2>&1; then
    xattr -cr "$p" 2>/dev/null || true
  fi
  if [[ "$(uname -s)" != "Darwin" ]]; then
    return 0
  fi
  if [[ -d "$p" && "$p" == *.app ]]; then
    codesign --remove-signature --deep "$p" 2>/dev/null \
      || codesign --remove-signature "$p" 2>/dev/null \
      || true
  fi
}

if [[ $# -eq 0 ]]; then
  echo "usage: strip-adhoc-signature.sh <path>..." >&2
  exit 1
fi

for arg in "$@"; do
  strip_one "$arg"
done
