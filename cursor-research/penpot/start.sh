#!/usr/bin/env bash
# Start local Penpot (host-network compose) and bridge :9001 → :8080
set -euo pipefail
cd "$(dirname "$0")"

if ! docker info >/dev/null 2>&1; then
  echo "Docker is not running." >&2
  exit 1
fi

docker compose -f docker-compose.host.yaml up -d

echo "Waiting for frontend on :8080…"
for i in $(seq 1 60); do
  if curl -fsS -o /dev/null http://127.0.0.1:8080/; then
    break
  fi
  sleep 2
done

if ! curl -fsS -o /dev/null http://127.0.0.1:8080/; then
  echo "Frontend did not become ready." >&2
  docker compose -f docker-compose.host.yaml logs --tail=40
  exit 1
fi

if ! curl -fsS -o /dev/null http://127.0.0.1:9001/ 2>/dev/null; then
  if command -v socat >/dev/null; then
    pkill -f 'socat TCP-LISTEN:9001' 2>/dev/null || true
    nohup socat TCP-LISTEN:9001,fork,reuseaddr TCP:127.0.0.1:8080 >/tmp/socat-penpot.log 2>&1 &
    sleep 1
  else
    echo "Install socat to expose http://localhost:9001 (frontend is on :8080)." >&2
  fi
fi

echo "Penpot ready: http://localhost:9001  (also http://localhost:8080)"
echo "Create a demo account from the login screen, then open Default → NIL Workspace Design System"
