# 관리자 개인 문서함

`/admin/documents`는 이력서·경력 자료·개인 파일을 관리하는 비공개 공간이다.
공개 블로그의 `/admin/storage`와 저장소·API를 분리한다.

## 저장 및 권한

- 메타데이터: MongoDB `private_documents` 컬렉션. 모든 조회·수정·삭제에 로그인 소유자 ID를 적용한다.
- 원본: MinIO `blog-private-documents` 버킷. `MINIO_PRIVATE_DOCUMENTS_BUCKET`으로 변경할 수 있지만 공개 블로그 버킷은 사용할 수 없다.
- 버킷은 최초 사용 시 생성한다. 버킷 정책이 존재하거나 비공개 상태를 확인할 수 없으면 파일 작업을 중단한다. 공개 정책을 자동 삭제하지 않는다.
- 객체 키는 UUID를 사용한다. 같은 파일 이름을 다시 올려도 기존 파일을 덮어쓰지 않는다.
- 파일·메타데이터 API는 서버에서 실제 ADMIN 역할을 검증한다. 브라우저 화면 게이트만으로 권한을 판단하지 않는다.
- 원본 URL·서명 URL은 제공하지 않는다. HTML·SVG도 인증된 다운로드 전용 응답으로 전달하며 브라우저 미리보기를 제공하지 않는다.
- 문서는 Blog·Feed·Vault 검색, sitemap, Agent 색인에 연결하지 않는다.

## 파일 정책

파일당 최대 10MiB. 여러 파일은 브라우저에서 개별 요청으로 순차 업로드하며, 각 파일의 성공·실패를 따로 표시한다.
Spring multipart 요청 상한은 경계 데이터까지 포함해 12MB다.

허용 확장자: PDF, MD, TXT, HTML, HTM, DOC, DOCX, XLS, XLSX, PPT, PPTX,
CSV, JSON, ZIP, 7Z, PNG, JPG, JPEG, WEBP, GIF, SVG, HWP, HWPX.
업로드 시 파일명에서 경로와 제어 문자를 제거한다. 실행 파일과 확장자가 없는 파일은 거부한다.

## API

| 메서드 | 경로 | 동작 |
| --- | --- | --- |
| GET | `/api/admin/documents` | 소유자별 검색·분류·페이지 조회 |
| POST | `/api/admin/documents` | multipart `file` 한 개, 분류·제목·설명 저장 |
| PUT | `/api/admin/documents/{id}` | 제목·설명·분류 수정 |
| DELETE | `/api/admin/documents/{id}` | 선택한 문서 하나 삭제 |
| GET | `/api/admin/documents/{id}/download` | 인증된 attachment 스트리밍 다운로드 |

API 응답은 `no-store`와 `X-Robots-Tag`를 설정한다.
다운로드는 `application/octet-stream`, `nosniff`, 실행을 막는 CSP를 사용한다.
DB 저장 실패 시 이번 업로드 객체만 정리한다. 삭제는 객체 삭제 성공 후 메타데이터를 지워 저장소 장애 시 재시도할 수 있게 한다.

## 운영 확인

- Nginx `/api/admin/documents` 업로드 경로만 `client_max_body_size 12M`으로 설정한다. 다른 업로드 경로의 한도는 유지한다.
- 공개 `bucket.kscold.com` 프록시에서 `/blog-private-documents` 경로를 차단한다. 사용자 지정 버킷 이름을 쓸 때는 같은 차단 규칙도 맞춘다.
- 프록시 설정의 원본은 `kscold-control/nginx`에서 관리한다. 실제 설정은 로컬 파일이며 공개 예제 설정을 함께 갱신한다.
- 원본 버킷과 MongoDB 메타데이터를 함께 백업해야 한다. 애플리케이션 JAR·프론트 배포 백업은 사용자 파일 백업을 대신하지 않는다.
- 개인 문서 화면에서는 외부 Analytics/AdSense를 로드하지 않는다. 진입 링크는 전체 페이지 이동으로 기존 공개 화면의 외부 스크립트도 분리한다.
- 배포 후 미인증 401·일반 회원 403, 관리자 업로드·검색·수정·다운로드·삭제, MinIO 익명 원본 403·공개 프록시 404를 확인한다.

문서 삭제는 영구 삭제다. 업로드 파일은 별도의 악성코드 검사를 수행하지 않으므로 본인이 신뢰하는 자료만 보관한다.
