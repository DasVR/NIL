#!/usr/bin/env bash
# Package-time launch check for the macOS .app (used by GitHub Actions).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BUNDLE_DIR="${ROOT}/desktop/src-tauri/target/release/bundle/macos"
LOG="${RUNNER_TEMP:-/tmp}/finn-macos-launch.log"
HOLD_SECONDS="${FINN_LAUNCH_HOLD_SECONDS:-12}"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "macos-launch-smoke.sh must run on macOS" >&2
  exit 1
fi

APP="$(find "${BUNDLE_DIR}" -maxdepth 1 -name '*.app' -print | head -n 1 || true)"
if [[ -z "${APP}" ]]; then
  echo "No .app found under ${BUNDLE_DIR}" >&2
  find "${ROOT}/desktop/src-tauri/target" -name '*.app' -o -name finn 2>/dev/null | head || true
  exit 1
fi

BIN="${APP}/Contents/MacOS/finn"
PLIST="${APP}/Contents/Info.plist"

echo "App: ${APP}"
echo "Binary: ${BIN}"
ls -la "${APP}/Contents/MacOS"
plutil -lint "${PLIST}"
IDENTIFIER="$(plutil -extract CFBundleIdentifier raw "${PLIST}")"
echo "CFBundleIdentifier=${IDENTIFIER}"
if [[ "${IDENTIFIER}" != "ai.finn.pentest" ]]; then
  echo "Unexpected bundle identifier" >&2
  plutil -p "${PLIST}"
  exit 1
fi

if ! plutil -p "${PLIST}" | grep -q NSAllowsLocalNetworking; then
  echo "Info.plist is missing NSAllowsLocalNetworking (localhost API would be blocked)" >&2
  plutil -p "${PLIST}"
  exit 1
fi

xattr -cr "${APP}" || true
codesign --force --deep --sign - "${APP}"
codesign -dv --verbose=2 "${APP}" || true

export RUST_BACKTRACE=1
: > "${LOG}"
"${BIN}" >>"${LOG}" 2>&1 &
PID=$!
echo "Started pid ${PID}"

cleanup() {
  if kill -0 "${PID}" 2>/dev/null; then
    kill "${PID}" 2>/dev/null || true
    wait "${PID}" 2>/dev/null || true
  fi
}
trap cleanup EXIT

slept=0
while (( slept < HOLD_SECONDS )); do
  if ! kill -0 "${PID}" 2>/dev/null; then
    echo "Finn exited before ${HOLD_SECONDS}s" >&2
    echo "----- launch log -----" >&2
    cat "${LOG}" >&2 || true
    echo "----- crash reports -----" >&2
    ls -lt "${HOME}/Library/Logs/DiagnosticReports" 2>/dev/null | head || true
    find "${HOME}/Library/Logs/DiagnosticReports" -name '*finn*' -o -name '*Finn*' 2>/dev/null | head | while read -r f; do
      echo "== ${f} ==" >&2
      tail -n 80 "${f}" >&2 || true
    done
    exit 1
  fi
  sleep 1
  slept=$((slept + 1))
done

if grep -Eiq 'panicked at|PluginInitialization|fatal runtime error' "${LOG}"; then
  echo "Launch log contains a panic" >&2
  cat "${LOG}" >&2
  exit 1
fi

echo "Finn stayed up for ${HOLD_SECONDS}s (pid ${PID})"
echo "----- launch log -----"
cat "${LOG}" || true
echo "macos launch smoke: ok"
