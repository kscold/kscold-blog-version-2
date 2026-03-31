# ubuntu-blog Live Deploy

이 문서는 `kscold.com` 운영 블로그의 **현재 실운영 배포 방식**을 정리한다.

## 결론

현재 운영은 `docker compose up --force-recreate ubuntu-blog` 방식이 아니라,

1. 호스트에서 빌드
2. 실행 중인 `ubuntu-blog` 컨테이너에 산출물만 덮어쓰기
3. `pm2 restart` 로 반영

흐름으로 배포하는 것이 맞다.

## 근거

- 운영 nginx는 `kscold.com`을 `ubuntu-blog`로 프록시한다.
  - frontend: `ubuntu-blog:3000`
  - api/ws/uploads: `ubuntu-blog:8080`
- 실제 운영 컨테이너 `ubuntu-blog`는 오래 살아 있고, 내부 `blog.jar`, `server.js`는 더 최근 시각으로 갱신되어 있었다.
- 컨테이너 내부에는 `/app/src`가 없어서 `scripts/deploy-blog.sh`의 `/app/src git pull` 방식은 현재 상태와 맞지 않는다.
- PM2는 `kscold-blog-backend`, `kscold-blog-frontend` 두 프로세스를 관리 중이다.

## 관련 파일

- `../kscold-control/docker-compose.yml`
- `../kscold-control/nginx/conf.d/kscold.conf`
- `scripts/deploy-blog.sh`  (현재 실운영 기준으로는 outdated)
- `../kscold-blog-docker/entrypoint.sh`

## 실운영 배포 절차

### 1. 백엔드 빌드

```bash
cd /Users/kscold/Desktop/kscold-blog-version-2/apps/api
./gradlew build -x test -q
```

### 2. 프론트엔드 빌드

```bash
cd /Users/kscold/Desktop/kscold-blog-version-2
pnpm install --frozen-lockfile -s

cd /Users/kscold/Desktop/kscold-blog-version-2/apps/web
NEXT_PUBLIC_API_URL=https://kscold.com/api \
NEXT_PUBLIC_SOCKET_URL=https://kscold.com \
pnpm build
```

### 3. 백엔드 산출물 교체

```bash
JAR=$(ls /Users/kscold/Desktop/kscold-blog-version-2/apps/api/build/libs/ | grep -v plain | head -1)

docker cp \
  /Users/kscold/Desktop/kscold-blog-version-2/apps/api/build/libs/${JAR} \
  ubuntu-blog:/app/backend/blog.jar
```

### 4. 프론트엔드 산출물 교체

```bash
docker exec ubuntu-blog sh -lc 'rm -rf /app/frontend/apps/web/.next /app/frontend/apps/web/public'

docker cp \
  /Users/kscold/Desktop/kscold-blog-version-2/apps/web/.next/standalone/apps/web/server.js \
  ubuntu-blog:/app/frontend/apps/web/server.js

docker cp \
  /Users/kscold/Desktop/kscold-blog-version-2/apps/web/.next/standalone/apps/web/.next \
  ubuntu-blog:/app/frontend/apps/web/.next

docker cp \
  /Users/kscold/Desktop/kscold-blog-version-2/apps/web/public \
  ubuntu-blog:/app/frontend/apps/web/public
```

### 5. PM2 재시작

```bash
docker exec ubuntu-blog sh -lc '
  pm2 restart kscold-blog-backend &&
  sleep 3 &&
  pm2 restart kscold-blog-frontend &&
  pm2 list
'
```

### 6. 확인

```bash
docker exec ubuntu-blog sh -lc 'ss -ltnp | grep -E ":(3000|8080|27017)\\b"'
curl -I https://kscold.com
```

## 의존성 변경 시 주의

프론트엔드 `package.json` 또는 lockfile 변경이 있으면,
현재 운영 컨테이너는 `/app/frontend/apps/web/node_modules`도 in-place 로 바뀐 흔적이 있으므로
산출물 복사만으로 부족할 수 있다.

이 경우 아래까지 함께 고려한다.

```bash
docker cp /Users/kscold/Desktop/kscold-blog-version-2/apps/web/package.json \
  ubuntu-blog:/app/frontend/apps/web/package.json

docker cp /Users/kscold/Desktop/kscold-blog-version-2/apps/web/pnpm-lock.yaml \
  ubuntu-blog:/app/frontend/apps/web/pnpm-lock.yaml

docker exec ubuntu-blog sh -lc '
  cd /app/frontend/apps/web &&
  pnpm install --frozen-lockfile
'
```

## 하지 말아야 할 것

### 1. 컨테이너 재생성부터 하지 말 것

`ubuntu-blog`는 현재 컨테이너 안에만 존재하는 상태가 있다.

- `/app/backend/.env`
- PM2 저장 상태
- 컨테이너 내부에서 갱신된 런타임 파일

즉, 아래 명령은 사전 정리 없이 바로 쓰면 위험하다.

```bash
cd /Users/kscold/Desktop/kscold-control
docker compose up -d --force-recreate ubuntu-blog
```

### 2. `scripts/deploy-blog.sh`를 현재 운영 방식이라고 가정하지 말 것

이 스크립트는 `/app/src` 기반인데, 실제 운영 컨테이너에는 `/app/src`가 없다.

## 향후 개선 방향

운영 안정성을 위해 나중에는 아래 중 하나로 정리하는 것이 좋다.

- `ubuntu-blog` 이미지를 재빌드/재생성해도 안전하도록 `.env`와 PM2 기동 명령을 compose/env_file 로 외부화
- 지금의 in-place 배포 절차를 `deploy-ubuntu-blog.sh`로 자동화

