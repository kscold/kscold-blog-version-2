#!/bin/bash
set -e

SRC=/app/src
BACKEND_DEST=/app/backend/blog.jar
FRONTEND_DEST=/app/frontend/apps/web

echo "[1/5] git pull..."
git -C $SRC pull origin main

echo "[2/5] 백엔드 빌드..."
cd $SRC/apps/api && ./gradlew build -x test -q
cp $SRC/apps/api/build/libs/blog-api-2.0.0.jar $BACKEND_DEST

echo "[3/5] 프론트엔드 빌드..."
cd $SRC && pnpm install --frozen-lockfile -s
cd $SRC/apps/web && pnpm build

echo "[4/5] 프론트엔드 배포..."
# .next 및 server.js 교체 (node_modules는 유지)
cp $SRC/apps/web/.next/standalone/apps/web/server.js $FRONTEND_DEST/server.js
rm -rf $FRONTEND_DEST/.next
cp -r $SRC/apps/web/.next/standalone/apps/web/.next $FRONTEND_DEST/.next
# static 파일 복사 (standalone에 미포함)
cp -r $SRC/apps/web/.next/static $FRONTEND_DEST/.next/static
# public 폴더 갱신
rm -rf $FRONTEND_DEST/public
cp -r $SRC/apps/web/public $FRONTEND_DEST/public

echo "[5/5] 서비스 재시작..."
pm2 restart kscold-blog-backend
sleep 3
pm2 restart kscold-blog-frontend
sleep 5
pm2 list

echo "배포 완료!"
