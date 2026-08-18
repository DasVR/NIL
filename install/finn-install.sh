#!/usr/bin/env bash
# Finn one-file installer (macOS + Linux).
#   User (default): no sudo, host sandbox, files under $HOME.
#   Admin: system paths + optional Docker (better isolation / performance).
#   Online (default): download GitHub release parts for this OS.
#   Offline: use files next to this script (.app, .dmg, .whl, run-api.py).
set -euo pipefail

REPO="${FINN_REPO:-DasVR/finn-pentest-harness}"
MODE="user"          # user | admin
CHANNEL="online"     # online | offline
SANDBOX="host"       # host | docker
FROM_SOURCE=0
PRINT_TOS=0
ACCEPT_TOS=0
TAG="${FINN_TAG:-latest}"

usage() {
  cat <<'EOF'
Usage: finn-install.sh [options]

  --user            User installer (default). No admin. Host sandbox.
  --admin           Admin installer. System paths, can enable Docker.
  --online          Download parts from GitHub Releases (default).
  --offline         Use .app / .dmg / .whl next to this script. No network.
  --host            Host sandbox (default). No Docker daemon.
  --docker          Docker sandbox (requires --accept-docker-tos).
  --accept-docker-tos
  --print-docker-tos
  --from-source     pip install the repo instead of a release asset.
  --tag vX.Y        Release tag (online). Default: latest.

The desktop app always starts the API itself after install.
EOF
}

DOCKER_TOS='Docker sandbox terms

Finn can run approved commands inside a Docker container on this computer. That uses your machine as the sandbox host.

• Docker Desktop / Engine typically requires administrator rights to install and to speak to the Docker daemon.
• Isolation is engagement separation, not a hypervisor jail.
• You are responsible for authorized testing only and for resource use.

I understand and accept these terms.'

while [[ $# -gt 0 ]]; do
  case "$1" in
    --user) MODE="user" ;;
    --admin) MODE="admin" ;;
    --online) CHANNEL="online" ;;
    --offline) CHANNEL="offline" ;;
    --host) SANDBOX="host" ;;
    --docker) SANDBOX="docker" ;;
    --from-source) FROM_SOURCE=1 ;;
    --accept-docker-tos) ACCEPT_TOS=1 ;;
    --print-docker-tos) PRINT_TOS=1 ;;
    --tag) TAG="$2"; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage; exit 1 ;;
  esac
  shift
done

if [[ "$PRINT_TOS" == "1" ]]; then
  printf '%s\n' "$DOCKER_TOS"
  exit 0
fi

if [[ "$SANDBOX" == "docker" && "$ACCEPT_TOS" != "1" ]]; then
  echo "Docker sandbox requires --accept-docker-tos. Read it with --print-docker-tos." >&2
  exit 1
fi

HERE="$(cd "$(dirname "$0")" && pwd)"
OS="$(uname -s)"
ARCH="$(uname -m)"
NEED_SUDO=0
if [[ "$MODE" == "admin" ]]; then
  NEED_SUDO=1
fi

if [[ "$MODE" == "user" ]]; then
  PREFIX="${FINN_PREFIX:-$HOME/.local/finn}"
  BIN="${XDG_BIN_HOME:-$HOME/.local/bin}"
  APP_DIR="$HOME/Applications"
  VENV="$HOME/.finn-pentest/venv"
else
  PREFIX="${FINN_PREFIX:-/usr/local/finn}"
  BIN="/usr/local/bin"
  APP_DIR="/Applications"
  VENV="/usr/local/finn/venv"
fi

run() {
  if [[ "$NEED_SUDO" == "1" && "$(id -u)" != "0" ]]; then
    sudo "$@"
  else
    "$@"
  fi
}

need_python() {
  if command -v python3 >/dev/null 2>&1; then
    python3 - <<'PY' || return 1
import sys
raise SystemExit(0 if sys.version_info >= (3, 11) else 1)
PY
    return 0
  fi
  return 1
}

install_python() {
  if need_python; then
    return 0
  fi
  if [[ "$CHANNEL" != "online" ]]; then
    echo "Python 3.11+ is required for offline install." >&2
    exit 1
  fi
  if [[ "$MODE" != "admin" ]]; then
    echo "Python 3.11+ not found. Install it, or rerun with --admin --online." >&2
    exit 1
  fi
  if [[ "$OS" == "Darwin" ]] && command -v brew >/dev/null 2>&1; then
    run brew install python@3.12
  elif command -v apt-get >/dev/null 2>&1; then
    run apt-get update
    run apt-get install -y python3 python3-venv python3-pip
  else
    echo "Install Python 3.11+ then rerun." >&2
    exit 1
  fi
}

github_asset_url() {
  local needle="$1"
  local api
  if [[ "$TAG" == "latest" ]]; then
    api="https://api.github.com/repos/${REPO}/releases/latest"
  else
    api="https://api.github.com/repos/${REPO}/releases/tags/${TAG}"
  fi
  python3 - "$api" "$needle" <<'PY'
import json, sys, urllib.request
api, needle = sys.argv[1], sys.argv[2].lower()
with urllib.request.urlopen(api, timeout=30) as r:
    data = json.load(r)
for asset in data.get("assets") or []:
    name = asset.get("name", "").lower()
    if needle in name:
        print(asset["browser_download_url"])
        break
else:
    sys.exit(2)
PY
}

download() {
  local url="$1" dest="$2"
  echo "==> Download $url"
  curl -fsSL "$url" -o "$dest"
}

install_api() {
  install_python
  run mkdir -p "$PREFIX" "$(dirname "$VENV")" "$BIN"
  local src="$HERE"
  if [[ -d "$HERE/api" ]]; then
    src="$HERE/api"
  elif [[ -d "$HERE/../finn_pentest" ]]; then
    src="$(cd "$HERE/.." && pwd)"
  fi
  if [[ -d "$src/finn_pentest" ]]; then
    run cp -R "$src/finn_pentest" "$PREFIX/"
    [[ -f "$src/pyproject.toml" ]] && run cp "$src/pyproject.toml" "$PREFIX/"
    [[ -d "$src/prompts" ]] && run cp -R "$src/prompts" "$PREFIX/prompts"
  fi
  if [[ -f "$HERE/run-api.py" ]]; then
    run cp "$HERE/run-api.py" "$PREFIX/run-api.py"
  elif [[ -f "$src/run-api.py" ]]; then
    run cp "$src/run-api.py" "$PREFIX/run-api.py"
  elif [[ -f "$HERE/../install/run-api.py" ]]; then
    run cp "$HERE/../install/run-api.py" "$PREFIX/run-api.py"
  fi

  if [[ "$CHANNEL" == "online" && "$FROM_SOURCE" != "1" ]]; then
    local wheel_url
    if wheel_url="$(github_asset_url '.whl' 2>/dev/null)"; then
      download "$wheel_url" /tmp/finn-pentest.whl
      run mkdir -p "$PREFIX"
      run cp /tmp/finn-pentest.whl "$PREFIX/"
    fi
  fi

  if [[ "$FROM_SOURCE" == "1" ]]; then
    run python3 -m pip install --upgrade pip
    if [[ "$MODE" == "user" ]]; then
      python3 -m pip install --user "$HERE/.."
    else
      run python3 -m pip install "$HERE/.."
    fi
  fi

  FINN_VENV="$VENV" FINN_API_ROOT="$PREFIX" python3 "$PREFIX/run-api.py" --check || \
    FINN_VENV="$VENV" FINN_API_ROOT="${src}" python3 "${HERE}/run-api.py" --check

  run mkdir -p "$BIN"
  run tee "$BIN/finn-api" >/dev/null <<EOF
#!/usr/bin/env bash
export FINN_API_ROOT="${PREFIX}"
export FINN_VENV="${VENV}"
exec python3 "${PREFIX}/run-api.py" "\$@"
EOF
  run chmod +x "$BIN/finn-api"
}

install_macos_app() {
  [[ "$OS" == "Darwin" ]] || return 0
  run mkdir -p "$APP_DIR"
  local app
  app="$(find "$HERE" -maxdepth 3 -name '*.app' -type d | head -1 || true)"
  if [[ -z "$app" && "$CHANNEL" == "online" ]]; then
    local zip_url
    zip_url="$(github_asset_url 'macos' || true)"
    if [[ -n "$zip_url" ]]; then
      download "$zip_url" /tmp/finn-macos.zip
      rm -rf /tmp/finn-macos-unpack
      mkdir -p /tmp/finn-macos-unpack
      if command -v ditto >/dev/null 2>&1; then
        ditto -x -k /tmp/finn-macos.zip /tmp/finn-macos-unpack
      else
        unzip -q /tmp/finn-macos.zip -d /tmp/finn-macos-unpack
      fi
      app="$(find /tmp/finn-macos-unpack -name '*.app' -type d | head -1 || true)"
    fi
  fi
  if [[ -n "$app" && -d "$app" ]]; then
    echo "==> Install $(basename "$app") → $APP_DIR"
    run rm -rf "$APP_DIR/$(basename "$app")"
    run cp -R "$app" "$APP_DIR/"
  fi
}

maybe_docker() {
  [[ "$SANDBOX" == "docker" ]] || return 0
  if docker info >/dev/null 2>&1; then
    echo "==> Docker is running"
    return 0
  fi
  if [[ "$MODE" != "admin" ]]; then
    echo "Docker sandbox selected but this is a user install. Rerun with --admin or use --host." >&2
    exit 1
  fi
  if [[ "$CHANNEL" != "online" ]]; then
    echo "Install Docker Desktop / Engine, then rerun. Offline mode cannot fetch Docker." >&2
    exit 1
  fi
  echo "==> Opening Docker install docs (engine typically needs admin)."
  if [[ "$OS" == "Darwin" ]]; then
    open "https://docs.docker.com/desktop/setup/install/mac-install/" || true
  else
    echo "See https://docs.docker.com/engine/install/"
  fi
}

write_runtime() {
  python3 - "$MODE" "$CHANNEL" "$SANDBOX" "$ACCEPT_TOS" <<'PY'
import json, os, sys
from pathlib import Path
from datetime import datetime, timezone
mode, channel, sandbox, tos = sys.argv[1:5]
home = Path.home() / ".finn-pentest"
home.mkdir(parents=True, exist_ok=True)
data = {
  "schema": 1,
  "setup_complete": True,
  "variant": "bundled",
  "privilege": mode,
  "channel": channel,
  "sandbox": sandbox,
  "features": {"ai": True, "tui": True, "bundled_api": True, "docker": sandbox == "docker"},
  "docker_tos_accepted": sandbox == "docker" and tos == "1",
  "docker_tos_accepted_at": datetime.now(timezone.utc).isoformat() if sandbox == "docker" and tos == "1" else None,
}
(home / "runtime.json").write_text(json.dumps(data, indent=2) + "\n")
print(f"Wrote {home / 'runtime.json'}")
PY
}

echo "==> Finn installer  mode=$MODE channel=$CHANNEL sandbox=$SANDBOX os=$OS arch=$ARCH"
install_api
install_macos_app
maybe_docker
write_runtime
echo "==> Done. Open the Finn app — the API starts with it."
echo "    CLI: $BIN/finn-api     data: $HOME/.finn-pentest"
if [[ "$MODE" == "admin" ]]; then
  echo "    Launch Finn as a normal user (not root) after this install."
fi
