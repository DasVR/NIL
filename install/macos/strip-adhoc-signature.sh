#!/usr/bin/env bash
# Historical name. Apple Silicon cannot launch unsigned apps, so this now
# ad-hoc-signs instead of stripping the signature.
set -euo pipefail
exec "$(cd "$(dirname "$0")" && pwd)/adhoc-sign.sh" "$@"
