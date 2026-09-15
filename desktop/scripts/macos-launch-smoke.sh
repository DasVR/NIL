#!/usr/bin/env bash
# macOS launch smoke for the built NIL.app.
#
# Runs on a real macOS runner after `tauri build --bundles app,dmg`. It is a
# sanity gate, NOT the three QA smokes (those are interactive UX flows — see
# desktop/README.md). Here we prove the bundle is well-formed, ad-hoc signed,
# and boots the webview without an immediate crash.
set -euo pipefail

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "macos-launch-smoke.sh is macOS-only (got $(uname -s)); skipping." >&2
  exit 0
fi

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BUNDLE_DIR="${ROOT}/desktop/src-tauri/target/release/bundle/macos"

APP="$(find "$BUNDLE_DIR" -maxdepth 1 -name '*.app' ! -name '*Setup*' -print 2>/dev/null | head -1 || true)"
if [[ -z "$APP" || ! -d "$APP" ]]; then
  echo "FAIL: no workstation .app in ${BUNDLE_DIR}" >&2
  exit 1
fi
echo "App bundle: $APP"

PLIST="${APP}/Contents/Info.plist"
[[ -f "$PLIST" ]] || { echo "FAIL: missing Info.plist" >&2; exit 1; }

read_plist() { /usr/libexec/PlistBuddy -c "Print :$1" "$PLIST" 2>/dev/null || true; }

EXE="$(read_plist CFBundleExecutable)"
IDENT="$(read_plist CFBundleIdentifier)"
MINOS="$(read_plist LSMinimumSystemVersion)"
VERSION="$(read_plist CFBundleShortVersionString)"
echo "  executable=${EXE} identifier=${IDENT} minOS=${MINOS} version=${VERSION}"

[[ -n "$EXE" && -x "${APP}/Contents/MacOS/${EXE}" ]] || { echo "FAIL: main executable missing/not executable" >&2; exit 1; }
[[ "$IDENT" == "dev.nil.workstation" ]] || { echo "FAIL: unexpected bundle identifier '${IDENT}'" >&2; exit 1; }
[[ -f "${APP}/Contents/Resources/icon.icns" ]] || echo "WARN: icon.icns not found in bundle" >&2

echo "Verifying code signature (ad-hoc is acceptable)..."
codesign --verify --deep --strict --verbose=2 "$APP" || {
  echo "Signature not valid; ad-hoc signing now..." >&2
  bash "${ROOT}/install/macos/adhoc-sign.sh" "$APP"
  codesign --verify --deep --strict --verbose=2 "$APP"
}

echo "Launching for a boot check..."
"${APP}/Contents/MacOS/${EXE}" >/tmp/nil-launch.log 2>&1 &
PID=$!
sleep 8
if kill -0 "$PID" 2>/dev/null; then
  echo "PASS: app launched and stayed up for 8s"
  kill "$PID" 2>/dev/null || true
  wait "$PID" 2>/dev/null || true
  exit 0
fi
wait "$PID" 2>/dev/null; RC=$?
echo "FAIL: app exited early (rc=${RC}). Log:" >&2
cat /tmp/nil-launch.log >&2 || true
exit 1
