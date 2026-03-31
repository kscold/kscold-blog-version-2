# KSCOLD Blog v2

Colding이 운영하는 김승찬(`kscold`)의 개인 기술 블로그입니다.  
블로그 포스트, Feed, Vault, 관리자 기능, 실시간 채팅을 하나의 모노레포에서 운영합니다.

## 프로젝트 컨셉

KSCOLD Blog v2는 단순히 글을 쌓아두는 블로그가 아니라,  
기술 기록과 짧은 생각, 연결된 노트, 운영 도구를 하나의 흐름으로 묶는 개인 퍼블리싱 시스템입니다.

이 프로젝트는 크게 세 가지 층위로 구성됩니다.

- Blog: 긴 호흡의 기술 글과 아카이브를 정리하는 메인 퍼블리싱 공간
- Feed: 링크, 메모, 짧은 생각을 빠르게 기록하는 타임라인형 공간
- Vault: 개념, 문장, 참고 내용을 서로 연결해 두는 개인 지식 베이스

여기에 관리자 화면과 실시간 채팅을 더해, 단순한 정적 블로그가 아니라  
직접 운영하고 관리하는 살아 있는 개인 기술 플랫폼을 지향합니다.

## 기술 스택

### 프론트엔드

- Next.js 15 (App Router, React 19, TypeScript)
- Tailwind CSS + Framer Motion
- Zustand + TanStack Query
- TipTap, Monaco Editor, React Markdown

### 백엔드

- Spring Boot 3.2.x (Java 21)
- Spring Data MongoDB
- Spring Security + JWT
- WebSocket 기반 실시간 채팅
- MinIO/S3 호환 업로드 + Discord 브릿지

### 인프라

- Turborepo + pnpm workspace
- Docker + Docker Compose
- Nginx 리버스 프록시

## 주요 기능

- 계층형 카테고리와 태그 중심의 포스트 아카이브
- Markdown/리치 텍스트 작성, 실시간 프리뷰, 파일 임포트 워크플로
- Feed와 Vault를 통한 짧은 기록과 연결형 지식 정리
- 운영용 관리자 대시보드와 콘텐츠 관리 UI
- JWT 인증, 관리자 보호 라우팅, 업로드 기능
- 방문자와 운영자를 잇는 1:1 실시간 채팅
- 검색, SEO, 반응형 UI

## 기능 설명

### Blog

Blog는 긴 호흡의 기술 글을 정리하는 메인 공간입니다.  
카테고리와 태그를 중심으로 글을 탐색할 수 있고, 포스트는 아카이브 성격에 맞게 축적됩니다.

### Feed

Feed는 완성된 글이 아니어도 바로 남길 수 있는 짧은 기록 공간입니다.  
링크, 메모, 인상 깊은 문장, 순간적인 생각을 빠르게 발행하는 데 초점을 둡니다.

### Vault

Vault는 블로그보다 더 밀도 높은 개인 지식 베이스 역할을 합니다.  
개념과 개념을 서로 연결하고, 축적된 노트를 탐색 가능한 형태로 유지하는 데 초점을 둡니다.

### Admin

관리자 화면에서는 포스트, 피드, Vault 노트, 카테고리, 태그, 접근 요청, 채팅까지 한 번에 운영할 수 있습니다.  
작성과 수정뿐 아니라 임포트, 검수, 운영 흐름까지 고려한 UI를 포함합니다.

### Realtime Chat

실시간 채팅은 방문자와 운영자가 1:1로 대화할 수 있는 지원 채널입니다.  
운영자는 어드민에서 대화를 관리하고, 필요하면 외부 알림 흐름과도 연결할 수 있습니다.

## 개발 환경

이 프로젝트는 Next.js 프론트엔드와 Spring Boot 백엔드를 분리한 모노레포 구조로 운영됩니다.  
개발과 배포 환경에서는 MongoDB, JWT, 업로드 스토리지, 채팅 관련 설정이 함께 사용됩니다.

## 프로젝트 구조

```text
kscold-blog-version-2/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/         # Next.js App Router 페이지
│   │   │   ├── entities/    # 도메인 단위 상태/모델/API
│   │   │   ├── features/    # 사용자 액션 중심 기능
│   │   │   ├── widgets/     # 화면 단위 UI 조합
│   │   │   ├── shared/      # 공통 유틸, API 클라이언트, UI
│   │   │   ├── styles/      # 전역 스타일
│   │   │   └── types/       # 타입 정의
│   │   └── package.json
│   └── api/
│       └── src/main/java/com/kscold/blog/
│           ├── blog/        # 포스트, 카테고리, 태그, 접근 요청
│           ├── chat/        # 실시간 채팅
│           ├── identity/    # 인증, 사용자, JWT
│           ├── social/      # Feed
│           ├── vault/       # Vault 노트/폴더
│           ├── media/       # 업로드
│           ├── shared/      # 공통 응답, AOP, 공용 도메인
│           ├── config/      # Spring 설정
│           └── exception/   # 예외 처리
├── docker/                  # 로컬/배포용 Docker 설정
├── turbo.json
├── pnpm-workspace.yaml
└── LICENSE.md
```

## API 엔드포인트

### 인증

- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/refresh` - 토큰 갱신
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

### Feed / Vault / Chat

- `GET /api/feeds` - Feed 조회
- `GET /api/vault/notes` - Vault 노트 조회
- `GET /api/chat/messages` - 내 채팅 내역 조회
- `POST /api/chat/messages` - 채팅 메시지 전송
- `GET /api/admin/chat/rooms` - 관리자 채팅방 조회 (ADMIN)

### 미디어

- `POST /api/media/upload` - 파일 업로드 (ADMIN)

## 라이선스

이 프로젝트는 MIT 라이선스가 아닙니다.  
저작권은 김승찬(`kscold`)과 Colding에 있으며, 사용 조건은 [LICENSE.md](./LICENSE.md)를 따릅니다.

## 작성자

- 김승찬 (`kscold`)
- Colding
