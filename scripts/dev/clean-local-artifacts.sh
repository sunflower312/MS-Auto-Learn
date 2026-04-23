#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

rm -rf \
  "${ROOT_DIR}/apps/api/dist" \
  "${ROOT_DIR}/apps/web/dist" \
  "${ROOT_DIR}/debug_artifacts"

find "${ROOT_DIR}/scripts" -type d -name "__pycache__" -prune -exec rm -rf {} +
