# KSCOLD Blog v2

Colding이 운영하는 김승찬(`kscold`)의 개인 기술 블로그입니다. 운영 주소는 [kscold.com](https://kscold.com)입니다.  
블로그 포스트, Feed, Vault, 방명록, 실시간 채팅, 관리자 기능을 하나의 모노레포에서 운영합니다.

## 프로젝트 컨셉

KSCOLD Blog v2는 단순히 글을 쌓아두는 블로그가 아니라,  
기술 기록과 짧은 생각, 연결된 노트, 운영 도구를 하나의 흐름으로 묶는 개인 퍼블리싱 시스템입니다.

이 프로젝트는 크게 세 가지 층위로 구성됩니다.

- Blog: 긴 호흡의 기술 글과 아카이브를 정리하는 메인 퍼블리싱 공간
- Feed: 링크, 메모, 짧은 생각을 빠르게 기록하는 타임라인형 공간
- Vault: 개념, 문장, 참고 내용을 서로 연결해 두는 개인 지식 베이스

여기에 관리자 화면과 실시간 채팅을 더해, 단순한 정적 블로그가 아니라  
직접 운영하고 관리하는 살아 있는 개인 기술 플랫폼을 지향합니다.

## 구성 요소

| 영역          | 설명                                                                                                                              |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Blog          | 계층형 카테고리와 태그로 정리하는 기술 글 아카이브. Markdown·리치 텍스트 작성, 파일 임포트, 글 단위 열람 요청을 지원합니다.       |
| Feed          | 완성된 글이 아니어도 바로 남기는 짧은 기록. 댓글, 좋아요, 멘션 알림을 포함합니다.                                                 |
| Vault         | 위키링크로 서로 연결되는 노트와 폴더. 그래프 탐색과 역링크를 제공합니다.                                                          |
| Vault Agent   | Vault·블로그·피드를 근거로 답하는 검색형 에이전트. Spring API가 gRPC로 Python LangGraph 서비스에 질문을 넘깁니다.                 |
| Guestbook     | 로그인한 방문자가 남기는 방명록과 운영자 답글.                                                                                    |
| Realtime Chat | 방문자와 운영자의 1:1 채팅. 웹소켓으로 주고받고 Discord 스레드와 이어집니다.                                                      |
| Admin Night   | 모임 신청과 프로그램 선호 조사를 받는 공개 페이지.                                                                                |
| Admin         | 콘텐츠·사용자·열람 요청·채팅 관리, 방문 통계, 알림 발송 기록, 스토리지 관리, 운영 화면 QA 실행까지 한곳에서 처리하는 관리자 화면. |

## 기술 스택

### 프론트엔드

- Next.js 15 (App Router) · React 19 · TypeScript 5
- Tailwind CSS · Framer Motion
- Zustand · TanStack Query
- TipTap · Monaco Editor · React Markdown · Mermaid
- Playwright (브라우저 E2E)

### 백엔드

- Spring Boot 4.1 · Java 21 (Spring Framework 7, Jackson 3)
- Spring Security 7 + JWT (HttpOnly 쿠키)
- Spring Data MongoDB 5 · MongoDB 7
- WebSocket 실시간 채팅 · SSE 스트리밍
- MinIO(S3 호환) 업로드 · SMTP 메일 · Discord 연동 · 카카오 알림톡
- gRPC 기반 Vault Agent Gateway
- ArchUnit · JUnit · Spotless

### Agent

- Python · LangGraph · gRPC
- OpenAI · Qdrant Vector DB

### 인프라

- Turborepo + pnpm workspace
- Docker · Nginx 리버스 프록시
- GitHub Actions (테스트, 이미지 빌드, 취약점 검사)

## 아키텍처

```text
브라우저 ── Nginx ──┬── Next.js (apps/web)
                    └── Spring API /api (apps/api) ──┬── MongoDB
                                                     ├── MinIO
                                                     └── gRPC ── Python Agent (apps/agent) ── Qdrant · OpenAI
```

- 백엔드는 기능 단위(바운디드 컨텍스트)마다 헥사고날 구조를 따릅니다. 컨트롤러는 `adapter.in.web`, 유스케이스는 `application.port.in`과
  `application.service`, 도메인 모델은 `domain.model`, 저장소·메일·외부 API 같은 바깥 의존은 `domain.port.out`과 `adapter.out`에 둡니다.
  이 규칙은 ArchUnit 테스트(`HexagonalArchitectureTest`)가 빌드에서 확인합니다.
- 프론트엔드는 FSD 구조를 따릅니다. `app → widgets → features → entities → shared` 방향으로만 의존합니다.
- 요청 DTO는 생성자로 바인딩하고 응답은 선언한 필드 순서로 내보냅니다. 운영과 같은 JSON 설정을 불러와 확인하는 계약 테스트
  (`JacksonContractTest`)가 프레임워크를 올릴 때 이 동작이 바뀌는 것을 막습니다.

## 프로젝트 구조

```text
kscold-blog-version-2/
├── apps/
│   ├── web/                     # Next.js 프론트엔드
│   │   ├── src/
│   │   │   ├── app/             # App Router 페이지와 라우트 핸들러
│   │   │   ├── widgets/         # 화면 단위 UI 조합
│   │   │   ├── features/        # 사용자 액션 중심 기능
│   │   │   ├── entities/        # 도메인 단위 상태·모델·API
│   │   │   └── shared/          # 공통 유틸, API 클라이언트, UI
│   │   └── e2e/                 # Playwright 시나리오
│   ├── api/                     # Spring Boot 백엔드
│   │   └── src/main/java/com/kscold/blog/
│   │       ├── blog/            # 포스트, 카테고리, 태그, 열람 요청
│   │       ├── social/          # Feed, 댓글, GitHub 연동
│   │       ├── vault/           # Vault 노트·폴더, Agent Gateway
│   │       ├── guestbook/       # 방명록
│   │       ├── chat/            # 실시간 채팅, Discord 브릿지
│   │       ├── identity/        # 인증, 사용자, JWT
│   │       ├── adminnight/      # Admin Night 신청·투표
│   │       ├── analytics/       # 방문 기록과 통계
│   │       ├── notification/    # 메일·Discord·알림톡 발송
│   │       ├── media/           # 업로드와 스토리지
│   │       ├── payment/         # 결제 연동
│   │       ├── shared/          # 공통 응답, AOP, 보안 정책
│   │       ├── config/          # Spring 설정
│   │       └── exception/       # 예외 처리
│   └── agent/                   # Python LangGraph + gRPC Vault Agent
├── docker/                      # Dockerfile, Compose, 운영 자동화 스크립트
│   └── maintenance/             # 백업 정리, 검색 노출 점검, QA 러너
├── .github/workflows/           # CI
├── turbo.json
├── pnpm-workspace.yaml
└── LICENSE.md
```

## 개발 환경

필요한 도구는 Node.js 20 이상, pnpm 8, JDK 21입니다.

```bash
pnpm install

# 프론트엔드: http://localhost:3001
pnpm --dir apps/web dev

# 백엔드: http://localhost:8081/api
cd apps/api && ./gradlew bootRun
```

백엔드를 띄우려면 다음 값이 필요합니다. 나머지 연동(메일, Discord, 알림톡, 결제, Agent)은 값이 없으면 해당 기능만 꺼진 채로 기동합니다.

| 환경 변수                              | 용도                        |
| -------------------------------------- | --------------------------- |
| `MONGODB_URI`                          | MongoDB 접속 주소           |
| `JWT_SECRET`                           | 토큰 서명 키 (256비트 이상) |
| `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY` | 업로드 스토리지 접속 정보   |

MongoDB, Qdrant, Agent까지 함께 띄우려면 `docker/.env.example`을 복사해 값을 채운 뒤 Compose를 사용합니다.

```bash
docker compose -f docker/docker-compose.yml up
```

## 품질 관리

```bash
# 백엔드: 테스트, 포맷 검사, 패키징
cd apps/api && ./gradlew test spotlessCheck bootJar

# 프론트엔드: 정적 검사와 브라우저 E2E
pnpm --dir apps/web lint
pnpm --dir apps/web type-check
pnpm --dir apps/web test:e2e

# CI와 같은 구성(운영 빌드 + 스텁 API)으로 전체 E2E 실행
pnpm --dir apps/web test:e2e:ci
```

- 백엔드 테스트는 550개 이상이며 구조 규칙(ArchUnit)과 JSON 계약 테스트를 포함합니다.
- 프론트엔드 E2E는 300개 이상의 Playwright 시나리오로, API 응답을 준비된 값으로 채워 화면 동작을 확인합니다.
- 화면 문구나 구조를 바꾼 뒤에는 푸시하기 전에 `test:e2e:ci`로 CI 결과를 먼저 확인합니다.

| 워크플로                                                | 확인하는 것                                                                          |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Backend CI                                              | 테스트, 포맷, 패키징, API 이미지 빌드와 실행 권한, 이미지 취약점 검사(High·Critical) |
| Frontend CI                                             | lint, type-check, 의존성 취약점 검사, 운영 빌드, Playwright E2E                      |
| Agent CI                                                | Python Agent 테스트                                                                  |
| QA Runner CI · SEO Watch CI · Agent Backup Retention CI | 운영 자동화 스크립트의 단위 테스트                                                   |

## API 엔드포인트

모든 경로는 `/api` 아래에 있고, 응답은 `{ success, data, message, errorCode, timestamp }` 형태로 통일합니다. 대표적인 경로만 적습니다.

### 인증

- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/refresh` - 토큰 갱신
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 현재 사용자 조회

### 포스트

- `GET /api/posts` - 포스트 목록 조회
- `GET /api/posts/featured` - 추천 포스트 조회
- `GET /api/posts/slug/{slug}` - 슬러그 조회
- `GET /api/posts/search?q=keyword` - 검색
- `POST /api/posts` - 포스트 생성 (ADMIN)
- `PUT /api/posts/{id}` - 포스트 수정 (ADMIN)
- `DELETE /api/posts/{id}` - 포스트 삭제 (ADMIN)

### 카테고리 / 태그

- `GET /api/categories` - 카테고리 조회
- `POST /api/categories` - 카테고리 생성 (ADMIN)
- `GET /api/tags` - 태그 조회
- `POST /api/tags/find-or-create` - 태그 조회 또는 생성 (ADMIN)

### Feed / Vault / 방명록

- `GET /api/feeds` - Feed 조회
- `POST /api/feeds/{id}/comments` - Feed 댓글 작성
- `GET /api/vault/notes` - Vault 노트 조회
- `GET /api/vault/notes/search?q=keyword` - Vault 노트 검색
- `POST /api/vault/agent/chat/stream` - Vault Agent 질문 (SSE)
- `GET /api/guestbook` - 방명록 조회
- `POST /api/guestbook` - 방명록 작성

### 채팅

- `GET /api/chat/messages` - 내 채팅 내역 조회
- `POST /api/chat/messages` - 채팅 메시지 전송
- `GET /api/admin/chat/rooms` - 관리자 채팅방 조회 (ADMIN)
- `WS /api/ws/chat` - 실시간 채팅 연결

### 미디어 / 상태

- `POST /api/media/upload` - 파일 업로드 (ADMIN)
- `GET /api/health` - 상태 확인

## 운영 자동화

운영 Mac에서 주기적으로 도는 작업은 `docker/maintenance/`에 스크립트와 테스트를 함께 둡니다.

### Agent 백업 자동 정리

Agent의 교체 배포 복구본은 `docker/maintenance/agent-backup-retention.mjs`로 관리합니다.
기본 실행은 미리보기이며, 실제 적용은 `--apply --prune-images`를 지정합니다.

```bash
node docker/maintenance/agent-backup-retention.mjs
node --test docker/maintenance/agent-backup-retention.test.mjs
node docker/maintenance/agent-backup-retention.mjs --apply --prune-images
```

- Colima의 운영 Agent가 healthy이고 기동 후 15분이 지났을 때만 정리합니다.
- 기본 모드는 최신 중지 복구본 2개를 보존합니다. 운영 Mac은 `--remove-all-stopped`로
  중지 백업을 남기지 않습니다. 두 모드 모두 중지 후 24시간 유예는 적용합니다.
- 실행 중이거나 볼륨이 있거나 쓰기 데이터가 1MiB를 초과하는 컨테이너는 건드리지 않습니다.
- 삭제 직전 상태를 재확인하고 배포/롤백 감지 시 중단합니다. 강제 삭제와 볼륨 삭제는 하지 않습니다.
- 이미지 정리는 이번에 삭제한 백업의 전용 미사용 이미지에 한정합니다.
  공유 이미지, 다른 저장소 태그 또는 복수 별칭이 있는 이미지는 보존합니다.
- `~/.local/state/kscold-agent-retention/audit.jsonl`에는 키 값 없이 ID와 정리 결과만 기록합니다.
- 운영 Mac의 하루 간격 자동 실행 설정은 `docker/com.kscold.agent-backup-retention.plist`입니다.
  LaunchAgents에 설치할 때 로그 디렉터리를 먼저 생성하고 Node 절대 경로를 확인해야 합니다.
  중지는 `launchctl bootout gui/$(id -u)/com.kscold.agent-backup-retention`으로 합니다.

### 검색 노출 점검 자동화

검색엔진과 광고 심사 크롤러가 사이트를 제대로 읽고 있는지는 `docker/maintenance/seo-watch.mjs`로 하루 한 번 확인합니다.
기본 실행은 미리보기이며, 색인 요청과 기록 저장은 `--apply`를 지정했을 때만 합니다.

```bash
node docker/maintenance/seo-watch.mjs
node --test docker/maintenance/seo-watch.test.mjs
node docker/maintenance/seo-watch.mjs --apply
```

- 상태 점검: 주요 화면과 최근에 고친 글의 title·description·canonical·구조화 데이터, 그리고
  `robots.txt`·`sitemap.xml`·`rss.xml`·`ads.txt`·`llms.txt`가 살아 있는지 확인합니다. 문제가 있으면 종료 코드 1로 끝납니다.
- 색인 요청: 사이트맵에서 새로 생겼거나 수정 시각이 바뀐 URL만 IndexNow로 알립니다(Bing·네이버 등).
  소유 확인 키는 `apps/web/public/<키>.txt`에서 읽으므로 스크립트에 따로 적지 않습니다.
- 크롤러 방문: Nginx 접근 로그의 `crawler` 필드로 지난 24시간 동안 다녀간 검색·AI·광고 크롤러를 종류별로 셉니다.
- 검색 순위: 검색 화면을 긁지 않고 공식 검색 API만 씁니다. `~/.config/kscold-seo-watch/env`에
  `NAVER_SEARCH_CLIENT_ID`·`NAVER_SEARCH_CLIENT_SECRET`(네이버 검색 API) 또는
  `GOOGLE_CSE_KEY`·`GOOGLE_CSE_CX`(Google Programmable Search)를 넣으면 기록하고, 없으면 건너뜁니다.
- 결과는 `SEO_WATCH_REPORT_DIR`(기본 `~/.local/state/kscold-seo-watch/reports`)에 날짜별 마크다운으로,
  추이는 `~/.local/state/kscold-seo-watch/history.jsonl`에 한 줄씩 남습니다.
- 운영 Mac의 매일 07:30 자동 실행은 `bash docker/maintenance/install-seo-watch.sh`로 설치합니다.
  macOS는 예약 작업이 데스크탑 폴더의 파일을 열면 화면에서 허용을 누를 때까지 멈추므로,
  설치 스크립트가 점검에 필요한 파일만 `~/.local/share/kscold-seo-watch`로 복사해 거기서 실행합니다.
  점검 스크립트를 고친 뒤에는 설치를 다시 실행해야 예약 작업에 반영됩니다.
  중지는 `launchctl bootout gui/$(id -u)/com.kscold.seo-watch`으로 합니다.

### 어드민 QA 러너

어드민의 QA / E2E 화면(`/admin/testing`)에서 누르는 "테스트 실행"은 운영 Mac에서 도는 러너 `docker/maintenance/qa-runner.mjs`가 받습니다.
러너는 Playwright로 `apps/web/e2e/admin-smoke.spec.ts`를 운영 주소에 대고 실행하고, 진행 로그와 화면별 스크린샷을 어드민에 돌려줍니다.

```bash
bash docker/maintenance/install-qa-runner.sh
node --test docker/maintenance/qa-runner*.test.mjs
pnpm qa:runner
```

- 스모크 스펙은 API 응답을 모두 준비된 값으로 채웁니다. 준비하지 않은 요청과 채팅 웹소켓은 브라우저 안에서 막아
  운영 백엔드와 DB에 닿지 않습니다.
- 러너는 `127.0.0.1:3305`에서만 접속을 받고, 요청마다 실린 관리자 토큰을 블로그 백엔드(`/api/auth/me`)에 다시 확인합니다.
  화면 서버가 넘겨준 토큰이 실제 관리자 것이 아니면 실행하지 않습니다.
- 실행 결과는 `~/.local/state/kscold-blog-qa/artifacts`에 최근 20회분을 두고, `~/.config/kscold-blog-qa/env`에
  `MINIO_ENDPOINT`·`MINIO_ACCESS_KEY`·`MINIO_SECRET_KEY`가 있으면 `blog` 버킷의 `qa-artifacts/`에도 올립니다.
- 설치 스크립트는 러너와 스모크 스펙, 저장소와 같은 판의 Playwright를 `~/.local/share/kscold-blog-qa`에 두고
  `com.kscold.blog-qa-runner` 서비스로 등록합니다(로그인 시 자동 시작, 죽으면 재시작).
  macOS는 예약 작업이 데스크탑 폴더의 파일을 열면 화면에서 허용을 누를 때까지 멈추기 때문에 저장소 밖에서 실행합니다.
- 스펙은 설치 시점의 사본입니다. 프런트엔드를 배포한 뒤에는 설치를 다시 실행해 운영 화면과 스펙을 맞춥니다.
  `pnpm qa:runner`는 설치 없이 저장소의 스펙으로 바로 띄워볼 때 씁니다.
- 중지는 `launchctl bootout gui/$(id -u)/com.kscold.blog-qa-runner`로 합니다.

## 라이선스

이 프로젝트는 MIT 라이선스가 아닙니다.  
저작권은 김승찬(`kscold`)과 Colding에 있으며, 사용 조건은 [LICENSE.md](./LICENSE.md)를 따릅니다.

## 작성자

- 김승찬 (`kscold`)
- Colding
