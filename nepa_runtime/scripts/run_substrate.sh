#!/usr/bin/env bash
# nepa_runtime/scripts/run_substrate.sh — boot FastAPI substrate server
# PR D-4
set -euo pipefail
cd "$(dirname "$0")/.."

PORT="${NEPA_SUBSTRATE_PORT:-8080}"
HOST="${NEPA_SUBSTRATE_HOST:-0.0.0.0}"

exec python -m uvicorn nepa_runtime.substrate.server:app \
  --host "$HOST" --port "$PORT" \
  ${NEPA_SUBSTRATE_RELOAD:+--reload}
