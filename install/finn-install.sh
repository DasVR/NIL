#!/usr/bin/env bash
# Thin CLI wrapper around Finn Setup (progress UI is install/finn-setup.py).
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
exec python3 "$HERE/finn-setup.py" --cli "$@"
