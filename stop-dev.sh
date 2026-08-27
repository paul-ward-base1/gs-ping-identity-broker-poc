#!/usr/bin/env bash
# Stops every app started by start-dev.sh: kills whatever is bound to their ports,
# plus the turbo/pnpm/yarn wrapper processes that spawned them (which don't hold a
# port themselves and would otherwise linger as orphans).
set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORTS=(3100 3200 3300 3000)

echo "==> Stopping dev servers on ports: ${PORTS[*]}"
for port in "${PORTS[@]}"; do
  pid=$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)
  if [ -n "$pid" ]; then
    echo "    killing PID $pid on port $port"
    kill "$pid" 2>/dev/null || true
  else
    echo "    port $port already free"
  fi
done

echo "==> Stopping turbo/yarn wrapper processes for this repo"
pids=$(pgrep -f "$ROOT_DIR" 2>/dev/null | grep -v "^$$\$" || true)
if [ -n "$pids" ]; then
  echo "$pids" | xargs kill 2>/dev/null || true
fi

if command -v caddy >/dev/null 2>&1; then
  echo "==> Stopping Caddy (if running)"
  caddy stop >/dev/null 2>&1 || true
fi

if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  echo "==> Stopping Redis container (data volume is preserved)"
  (cd "$ROOT_DIR" && docker compose stop redis) >/dev/null 2>&1 || true
fi
