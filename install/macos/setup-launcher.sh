#!/bin/bash
# CFBundleExecutable for Finn Setup.app. Finder launches this with a tiny PATH
# and often a Homebrew python that has no Tk — that used to skip the wizard
# and run a silent --cli install (no options). Pick a Python that can import
# tkinter; otherwise ask with osascript, then run the CLI with those choices.
set -euo pipefail

RES="$(cd "$(dirname "$0")/../Resources" && pwd)"
export FINN_SETUP_PAYLOAD="${RES}/payload"
export PYTHONPATH="${RES}${PYTHONPATH:+:${PYTHONPATH}}"
export PATH="/Library/Frameworks/Python.framework/Versions/Current/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${PATH:-}"

WIZARD="${RES}/wizard.py"

has_tk() {
  local py="$1"
  "$py" -c 'import sys, tkinter; raise SystemExit(0 if sys.version_info >= (3, 11) else 1)' >/dev/null 2>&1
}

has_py() {
  local py="$1"
  "$py" -c 'import sys; raise SystemExit(0 if sys.version_info >= (3, 11) else 1)' >/dev/null 2>&1
}

pick_tk_python() {
  local c
  for c in \
    /Library/Frameworks/Python.framework/Versions/Current/bin/python3 \
    /usr/bin/python3 \
    /opt/homebrew/bin/python3 \
    /usr/local/bin/python3 \
    python3.13 python3.12 python3.11 python3 python3.14
  do
    command -v "$c" >/dev/null 2>&1 || continue
    c="$(command -v "$c")"
    if has_tk "$c"; then
      printf '%s\n' "$c"
      return 0
    fi
  done
  return 1
}

pick_any_python() {
  local c
  for c in \
    /Library/Frameworks/Python.framework/Versions/Current/bin/python3 \
    /usr/bin/python3 \
    /opt/homebrew/bin/python3 \
    /usr/local/bin/python3 \
    python3.13 python3.12 python3.11 python3 python3.14
  do
    command -v "$c" >/dev/null 2>&1 || continue
    c="$(command -v "$c")"
    if has_py "$c"; then
      printf '%s\n' "$c"
      return 0
    fi
  done
  return 1
}

ask() {
  local prompt="$1"
  local a="$2"
  local b="$3"
  local default="$4"
  osascript - "$prompt" "$a" "$b" "$default" <<'APPLESCRIPT'
on run argv
  set promptText to item 1 of argv
  set choiceA to item 2 of argv
  set choiceB to item 3 of argv
  set defaultChoice to item 4 of argv
  set picked to choose from list {choiceA, choiceB} with title "Finn Setup" with prompt promptText default items {defaultChoice} OK button name "Continue" cancel button name "Cancel"
  if picked is false then error number -128
  return item 1 of picked
end run
APPLESCRIPT
}

ask_cli_options() {
  local who src_choice how
  local offline
  offline=0
  who="$(ask "Who is installing?" "This Mac, this user" "This Mac, all users" "This Mac, this user")" || return 1
  if [[ -d "${FINN_SETUP_PAYLOAD}/finn_pentest" ]]; then
    offline=1
  elif find "${FINN_SETUP_PAYLOAD}" -maxdepth 1 -name '*.app' ! -name '*Setup*' 2>/dev/null | grep -q .; then
    offline=1
  fi
  if [[ "$offline" -eq 1 ]]; then
    src_choice="$(ask "Where do the files come from?" "This folder (offline)" "Download (online)" "This folder (offline)")" || return 1
  else
    src_choice="$(ask "Where do the files come from?" "This folder (offline)" "Download (online)" "Download (online)")" || return 1
  fi
  how="$(ask "How should tools run?" "Host sandbox" "Docker sandbox" "Host sandbox")" || return 1

  PRIV=--user
  [[ "$who" == "This Mac, all users" ]] && PRIV=--admin
  CHAN=--online
  [[ "$src_choice" == "This folder (offline)" ]] && CHAN=--offline
  SAND=--host
  TOS=()
  if [[ "$how" == "Docker sandbox" ]]; then
    SAND=--docker
    PRIV=--admin
    osascript -e 'display dialog "Docker sandbox uses your machine as the host. Isolation is engagement separation, not a hypervisor jail. Authorized testing only." with title "Finn Setup" buttons {"Cancel", "Accept"} default button "Accept" cancel button "Cancel"' >/dev/null
    TOS=(--accept-docker-tos)
  fi
  printf '%s\n' "$PRIV" "$CHAN" "$SAND" "${TOS[@]+"${TOS[@]}"}"
}

PY_TK="$(pick_tk_python || true)"
if [[ -n "${PY_TK}" ]]; then
  cd "${HOME:-/tmp}"
  exec "${PY_TK}" "${WIZARD}"
fi

PY="$(pick_any_python || true)"
if [[ -z "${PY}" ]]; then
  osascript -e 'display alert "Finn Setup" message "Python 3.11+ is required. Install it from python.org (includes Tk) or: brew install python-tk. Then open Finn Setup again."'
  exit 1
fi

osascript -e 'display alert "Finn Setup" message "This Mac’s Python has no Tk window kit, so Setup will ask the install questions in system dialogs. To get the full installer window: brew install python-tk  or install Python from python.org."' || true

OPT_FILE="$(mktemp "${TMPDIR:-/tmp}/finn-setup.XXXXXX")"
trap 'rm -f "$OPT_FILE"' EXIT
if ! ask_cli_options > "$OPT_FILE"; then
  exit 0
fi
FLAGS=()
while IFS= read -r line; do
  [[ -n "$line" ]] && FLAGS+=("$line")
done < "$OPT_FILE"
if [[ ${#FLAGS[@]} -lt 3 ]]; then
  exit 0
fi
rm -f "$OPT_FILE"
trap - EXIT
cd "${HOME:-/tmp}"
exec "${PY}" "${WIZARD}" --cli "${FLAGS[@]}"
