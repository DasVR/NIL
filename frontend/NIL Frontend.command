#!/bin/sh
# NIL Frontend macOS one-click runner
# Right-click → Open if Gatekeeper complains the first time.

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR" || exit 1

echo "Starting NIL frontend..."
python3 -m http.server 3000 --directory build
