#!/usr/bin/env bash

# CI의 "운영 빌드 검사"와 "브라우저 E2E 검사"를 로컬에서 같은 구성으로 실행한다.
# 푸시하기 전에 돌려, 로컬 dev 서버에서는 통과하던 변경이 CI에서 처음 실패하는 일을 줄인다.
# 사용법: ./scripts/run-e2e-ci.sh [--skip-build] [playwright 인자...]
# 실행 뒤 남는 .next는 검증용 스텁 빌드다. 운영 배포는 배포 스크립트가 다시 빌드한다.

set -uo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
APP_DIR=$(cd "$SCRIPT_DIR/.." && pwd)
REPO_ROOT=$(cd "$APP_DIR/../.." && pwd)

# CI에는 .env.local이 없다. 로컬 값이 섞이지 않도록 CI와 같은 값으로 덮어쓴다.
export CI=1
export NEXT_TELEMETRY_DISABLED=1
export API_INTERNAL_URL=http://127.0.0.1:4100/api
export NEXT_PUBLIC_API_URL='' NEXT_PUBLIC_WS_URL='' NEXT_PUBLIC_GA_ID='' NEXT_PUBLIC_ADSENSE_ID=''
export PLAYWRIGHT_BASE_URL=http://127.0.0.1:3101

skip_build=0
if [ "${1:-}" = "--skip-build" ]; then
  skip_build=1
  shift
fi

# pnpm이 띄운 next-server는 래퍼만 종료해서는 남는다. 남은 서버가 예전 빌드를 계속 내주면
# 다음 실행의 테스트가 통째로 실패하므로, 이 스크립트가 쓰는 포트의 프로세스를 직접 정리한다.
free_ports() {
  local port pid
  for port in 3101 3102 4100; do
    for pid in $(lsof -nP -t -iTCP:"$port" -sTCP:LISTEN 2>/dev/null); do
      kill "$pid" 2>/dev/null
    done
  done
}

wait_for() {
  local attempt
  for attempt in $(seq 1 80); do
    if curl --fail --silent "$1" >/dev/null; then
      return 0
    fi
    sleep 0.25
  done
  echo "응답을 기다리다 중단했습니다: $1" >&2
  return 1
}

trap free_ports EXIT
free_ports
cd "$REPO_ROOT"

node apps/web/e2e/support/build-api-stub.mjs &
wait_for http://127.0.0.1:4100/api/health || exit 1

if [ "$skip_build" -eq 0 ]; then
  # 이전 빌드가 남긴 API 응답 캐시를 쓰면 예전 스텁 응답으로 화면이 미리 그려진다. CI처럼 빈 캐시에서 시작한다.
  rm -rf "$APP_DIR/.next/cache/fetch-cache"
  pnpm --dir apps/web build || exit 1
fi

pnpm --dir apps/web exec next start --hostname 127.0.0.1 -p 3102 &
node apps/web/e2e/support/ci-web-proxy.mjs &
wait_for http://127.0.0.1:3101/api/health || exit 1
wait_for http://127.0.0.1:3101/ || exit 1

pnpm --dir apps/web exec playwright test "$@"
