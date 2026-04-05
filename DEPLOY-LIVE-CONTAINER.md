# ubuntu-blog Live Deploy

이 문서는 `kscold.com` 운영 블로그의 **현재 실운영 배포 방식**과 **표준 배포 절차**를 정리한다.

## 결론

현재 운영은 `docker compose up --force-recreate ubuntu-blog` 방식이 아니라,

1. 호스트에서 빌드
2. 실행 중인 `ubuntu-blog` 컨테이너에 tar로 묶은 산출물만 덮어쓰기
3. `pm2 restart` 로 반영

흐름으로 배포하는 것이 맞다.

이 절차는 이제 `scripts/deploy-live-container.sh`로 고정한다.

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
- `scripts/deploy-live-container.sh`  (현재 표준 배포 스크립트)
- `scripts/deploy-blog.sh`  (호환용 wrapper, 내부적으로 표준 스크립트를 호출)
- `../kscold-blog-docker/entrypoint.sh`

## 표준 배포 명령

```bash
cd /Users/kscold/Desktop/kscold-blog-version-2
./scripts/deploy-live-container.sh
```

옵션:

- 프런트만 배포
```bash
./scripts/deploy-live-container.sh --frontend-only
```

- 백엔드만 배포
```bash
./scripts/deploy-live-container.sh --backend-only
```

## 표준 배포 절차

### 1. 백엔드 빌드 후 JAR 교체

- `./gradlew bootJar`
- 생성된 JAR를 `/app/backend/blog.jar`로 교체
- `pm2 restart kscold-blog-backend`
- `/api/health` 확인

### 2. 프런트엔드 빌드 후 runtime tar 교체

- `pnpm install --frozen-lockfile`
- `pnpm --dir apps/web build`
- `.next`, `public`, `server.js`, `apps/web/package.json`, `pnpm-lock.yaml`를 하나의 tarball로 묶음
- 컨테이너 안 `/app/frontend/apps/web`에 tarball을 풀어 씀
- `pnpm install --prod --frozen-lockfile --ignore-scripts`
- `pm2 restart kscold-blog-frontend`
- 내부 `http://127.0.0.1:3000/` 확인

## 의존성 변경 시 주의

표준 스크립트는 `apps/web/package.json`과 루트 `pnpm-lock.yaml`을 함께 동기화하고,
컨테이너 안에서 `pnpm install --prod --frozen-lockfile --ignore-scripts`까지 수행한다.

즉, 프런트 런타임 의존성이 추가되더라도
사람이 별도로 `node_modules`를 기억해서 맞춰줄 필요가 없게 정리한 상태다.

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

이 스크립트는 이제 호환용 wrapper이며, 내부적으로 표준 스크립트를 호출한다.

## 향후 개선 방향

운영 안정성을 위해 나중에는 아래 중 하나로 정리하는 것이 좋다.

- `ubuntu-blog` 이미지를 재빌드/재생성해도 안전하도록 `.env`와 PM2 기동 명령을 compose/env_file 로 외부화
- 지금의 in-place 배포 절차를 유지하되, 더 나아가 runtime 디렉터리 전체를 artifact 단위로 롤백 가능하게 만들기
