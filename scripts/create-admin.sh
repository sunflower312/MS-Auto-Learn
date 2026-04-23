#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="${ROOT_DIR}/infra/docker/compose.dev.yml"

USERNAME="${1:-}"
PASSWORD="${2:-}"
RETRY_LIMIT="${AUTOLEARN_CREATE_ADMIN_RETRIES:-15}"

if [[ -z "${USERNAME}" || -z "${PASSWORD}" ]]; then
  echo "Usage: scripts/create-admin.sh <username> <password>" >&2
  exit 1
fi

for ((attempt = 1; attempt <= RETRY_LIMIT; attempt += 1)); do
  if docker compose -f "${COMPOSE_FILE}" exec -T api \
    pnpm --filter @autolearn/api exec tsx dist/src/cli/create-admin.js "${USERNAME}" "${PASSWORD}"; then
    exit 0
  fi

  if [[ "${attempt}" -eq "${RETRY_LIMIT}" ]]; then
    echo "Failed to create admin user after ${RETRY_LIMIT} attempts." >&2
    exit 1
  fi

  sleep 2
done
