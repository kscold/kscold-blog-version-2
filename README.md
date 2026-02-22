# KSCOLD Blog v2

COLDING 스튜디오의 개인 기술 블로그. Markdown 기반 포스팅 시스템.

## 기술 스택

### 프론트엔드
- Next.js 15 (App Router, TypeScript)
- Tailwind CSS + Framer Motion
- Zustand (상태 관리) + React Query (서버 상태)

### 백엔드
- Spring Boot 3.x (Java 21)
- Spring Data MongoDB + MongoDB Atlas
- Spring Security + JWT
- WebSocket (실시간 채팅)

### 인프라
- Turborepo (모노레포)
- Docker + Docker Compose
- Nginx (리버스 프록시)

## 주요 기능

- 5단계 계층 카테고리
- Markdown 에디터 + 실시간 프리뷰
- Markdown 파일 임포트 (옵시디언, 노션 내보내기 지원)
- 코드 문법 하이라이팅
- 실시간 채팅 (Socket.IO)
- SEO 최적화
- 전문 검색 + 태그 필터링
- 반응형 디자인

## 시작하기

### 필수 요구사항

- Node.js 20+
- pnpm 8+
- Java 21
- MongoDB 7.0 (또는 MongoDB Atlas)

### 설치

```bash
git clone https://github.com/kscold/kscold-blog-version-2.git
cd kscold-blog-version-2
pnpm install
```

### 환경 변수 설정

```bash
# 백엔드: application-local.yml 생성
cp apps/api/src/main/resources/application.yml apps/api/src/main/resources/application-local.yml
# application-local.yml에 MongoDB Atlas URI, JWT Secret 등 실제 값 입력
```

### 개발 서버 실행

```bash
# 터미널 1: Spring Boot API
cd apps/api
./gradlew bootRun

# 터미널 2: Next.js
cd apps/web
pnpm dev
```

### 접속

- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:8080/api

## 프로젝트 구조

```
kscold-blog-version-2/
├── apps/
│   ├── web/                  # Next.js 프론트엔드
│   │   ├── src/
│   │   │   ├── app/          # 페이지 (홈, 블로그, 어드민, 로그인)
│   │   │   ├── components/   # 레이아웃, 블로그, 채팅, 공통 컴포넌트
│   │   │   ├── hooks/        # React Query 훅 (usePosts, useCategories, useAuth)
│   │   │   ├── lib/          # API 클라이언트, Markdown 파서
│   │   │   ├── store/        # Zustand 스토어
│   │   │   └── types/        # TypeScript 타입 정의
│   │   └── package.json
│   └── api/                  # Spring Boot 백엔드
│       └── src/main/java/com/kscold/blog/
│           ├── controller/   # REST API 엔드포인트
│           ├── service/      # 비즈니스 로직
│           ├── repository/   # MongoDB 데이터 접근
│           ├── model/        # 도메인 엔티티
│           ├── dto/          # 요청/응답 DTO
│           ├── security/     # JWT 인증
│           └── exception/    # 에러 처리
├── docker/                   # Docker Compose 설정
├── turbo.json
└── pnpm-workspace.yaml
```

## API 엔드포인트

### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/me` - 현재 사용자 조회

### 포스트
- `GET /api/posts` - 전체 조회 (페이지네이션)
- `GET /api/posts/featured` - 추천 포스트
- `GET /api/posts/slug/:slug` - 슬러그로 조회
- `GET /api/posts/search?q=keyword` - 검색
- `POST /api/posts` - 생성 (ADMIN)
- `PUT /api/posts/:id` - 수정 (ADMIN)
- `DELETE /api/posts/:id` - 삭제 (ADMIN)

### 카테고리
- `GET /api/categories` - 전체 조회 (트리 구조)
- `POST /api/categories` - 생성 (ADMIN)

### 태그
- `GET /api/tags` - 전체 조회
- `POST /api/tags/find-or-create` - 조회 또는 자동 생성 (ADMIN)

### 미디어
- `POST /api/media/upload` - 파일 업로드 (ADMIN)

## 라이선스

MIT License

## 작성자

김승찬 (kscold) - [GitHub](https://github.com/kscold)
