#!/bin/bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

echo "[deprecated] scripts/deploy-blog.sh는 현재 운영 기준으로 더 이상 직접 사용하지 않습니다."
echo "             표준 배포 스크립트인 scripts/deploy-live-container.sh를 실행합니다."

exec "${SCRIPT_DIR}/deploy-live-container.sh" "$@"
