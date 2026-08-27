#!/usr/bin/env bash
# Starts every app in this repo for local development:
#   mock-shop (3100), mock-mygs (3200), gs-registration (3300) via `pnpm dev`
#   gs-leadertools (3000) separately, since it's excluded from the pnpm workspace
set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$ROOT_DIR/.logs"
mkdir -p "$LOG_DIR"

"$ROOT_DIR/stop-dev.sh"
sleep 1

trap "$ROOT_DIR/stop-dev.sh" EXIT INT TERM

REDIS_STARTED=0
if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  echo "==> Starting Redis with Docker Compose"
  if (cd "$ROOT_DIR" && docker compose up -d redis) > "$LOG_DIR/redis.log" 2>&1; then
    REDIS_STARTED=1
  else
    echo "    Redis container failed to start (see $LOG_DIR/redis.log) — cross-app logout propagation may not work"
  fi
else
  echo "==> Docker Compose not available — skipping Redis (cross-app logout propagation may not work)"
fi

echo "==> Starting mock-shop, mock-mygs, gs-registration via turbo (pnpm dev)"
(cd "$ROOT_DIR" && pnpm dev) > "$LOG_DIR/turbo.log" 2>&1 &

echo "==> Starting gs-leadertools (excluded from pnpm workspace)"
(cd "$ROOT_DIR/apps/gs-leadertools" && ENV=dev yarn dev) > "$LOG_DIR/gs-leadertools.log" 2>&1 &

CADDY_STARTED=0
if command -v caddy >/dev/null 2>&1; then
  echo "==> Starting Caddy (HTTPS for .local hostnames, see Caddyfile)"
  # Stop any other instance first — only one Caddy can bind 80/443 at a time,
  # and the sibling gs-identity-broker-poc repo may have its own running.
  caddy stop >/dev/null 2>&1 || true
  if (cd "$ROOT_DIR" && caddy start --config Caddyfile --adapter caddyfile) > "$LOG_DIR/caddy.log" 2>&1; then
    CADDY_STARTED=1
  else
    echo "    Caddy failed to start (see $LOG_DIR/caddy.log) — continuing without HTTPS .local hostnames"
  fi
else
  echo "==> Caddy not installed — skipping HTTPS .local hostnames (plain http://localhost still works)"
fi

sleep 2
cat <<EOF

All apps starting:
  mock-shop        http://localhost:3100
  mock-mygs        http://localhost:3200
  gs-registration  http://localhost:3300
  gs-leadertools   http://localhost:3000
EOF

if [ "$REDIS_STARTED" = "1" ]; then
cat <<EOF

Shared Redis:      redis://localhost:6379 (Docker Compose)
EOF
fi

if [ "$CADDY_STARTED" = "1" ]; then
cat <<EOF

Also reachable over real HTTPS via Caddy:
  mock-shop        https://girlscoutsshop.local
  mock-mygs        https://my-gs.local
  gs-registration  https://gsregistration.local
  gs-leadertools   https://leadertools.local
  Gigya auth proxy https://cdc-login.gsusa.local
EOF
fi

cat <<EOF

Logs: $LOG_DIR/turbo.log, $LOG_DIR/gs-leadertools.log, $LOG_DIR/redis.log
Press Ctrl+C to stop everything.
EOF

tail -f "$LOG_DIR"/turbo.log "$LOG_DIR"/gs-leadertools.log
