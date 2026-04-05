#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
APP_DIR=$(cd "$SCRIPT_DIR/.." && pwd)
TMP_DIR=$(mktemp -d)

cleanup() {
  if [ -f "$TMP_DIR/tsconfig.json" ]; then
    cp "$TMP_DIR/tsconfig.json" "$APP_DIR/tsconfig.json"
  fi

  if [ -f "$TMP_DIR/next-env.d.ts" ]; then
    cp "$TMP_DIR/next-env.d.ts" "$APP_DIR/next-env.d.ts"
  fi

  rm -rf "$APP_DIR/.next-e2e" "$TMP_DIR"
}

trap cleanup EXIT INT TERM

cp "$APP_DIR/tsconfig.json" "$TMP_DIR/tsconfig.json"
cp "$APP_DIR/next-env.d.ts" "$TMP_DIR/next-env.d.ts"

cd "$APP_DIR"

NEXT_DIST_DIR=.next-e2e \
NEXT_PUBLIC_API_URL= \
NEXT_PUBLIC_WS_URL= \
NEXT_PUBLIC_GTM_ID= \
NEXT_PUBLIC_GA_ID= \
pnpm exec next dev -p 3101
