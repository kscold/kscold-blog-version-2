#!/usr/bin/env bash

# output: standalone 산출물을 실제 운영과 같은 서버 진입점으로 검사한다.
set -euo pipefail

APP_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
STANDALONE_DIR="$APP_DIR/.next/standalone/apps/web"

if [ ! -f "$STANDALONE_DIR/server.js" ]; then
  echo '먼저 웹 운영 빌드를 실행해야 합니다.' >&2
  exit 1
fi

# Next standalone은 정적 파일을 자동 복사하지 않는다. 검증에서는 원본을 연결해
# 대용량 공개 자료의 중복 복사 없이 Dockerfile과 같은 파일 배치를 만든다.
link_asset() {
  local source=$1 destination=$2
  if [ -L "$destination" ] && [ "$(readlink "$destination")" = "$source" ]; then
    return
  fi
  if [ -e "$destination" ] || [ -L "$destination" ]; then
    echo "예상하지 않은 검증 산출물 경로: $destination" >&2
    exit 1
  fi
  ln -s "$source" "$destination"
}

link_asset "$APP_DIR/public" "$STANDALONE_DIR/public"
link_asset "$APP_DIR/.next/static" "$STANDALONE_DIR/.next/static"
export HOSTNAME=127.0.0.1 PORT=3102
exec node "$STANDALONE_DIR/server.js"
