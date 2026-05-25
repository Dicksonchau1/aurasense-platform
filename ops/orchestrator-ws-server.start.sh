#!/usr/bin/env bash
# ops/orchestrator-ws-server.start.sh
# PR D-3
set -euo pipefail
cd "$(dirname "$0")/.."
exec pnpm tsx ops/orchestrator-ws-server.ts
