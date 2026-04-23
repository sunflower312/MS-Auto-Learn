#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
COMPOSE_FILE="${ROOT_DIR}/infra/docker/compose.dev.yml"
OWNER="${GHCR_OWNER:-${GITHUB_REPOSITORY_OWNER:-}}"
TAG="${AUTOLEARN_IMAGE_TAG:-latest}"

if [[ -z "${OWNER}" ]]; then
  echo "Missing GHCR owner. Set GHCR_OWNER=<repository-owner> before pulling images." >&2
  exit 1
fi

export AUTOLEARN_API_IMAGE="${AUTOLEARN_API_IMAGE:-ghcr.io/${OWNER}/microsoft-auto-learn-api:${TAG}}"
export AUTOLEARN_WEB_IMAGE="${AUTOLEARN_WEB_IMAGE:-ghcr.io/${OWNER}/microsoft-auto-learn-web:${TAG}}"
docker compose -f "${COMPOSE_FILE}" pull
docker compose -f "${COMPOSE_FILE}" up -d --remove-orphans
