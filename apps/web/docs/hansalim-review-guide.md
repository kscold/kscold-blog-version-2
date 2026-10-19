# 한살림 교육 후기 — 작성 설계

2026-10-21 한살림성남용인 「AI 업무활용 및 개인정보보호 교육」이 끝난 뒤, 맥미니에 접속해 직접(또는 시연 중에 에이전트와 함께) 후기 글을 올리고 `kscold.com/hansalim`에 연결하기 위한 설계다.

## 1. 결과물

| 무엇 | 어디 | 비고 |
|---|---|---|
| 후기 글 | 블로그 글 (`/admin/posts/new`) | 카테고리 **개발 이야기**(`dev-story`), 공개 |
| 다운로드 페이지의 후기 카드 | `kscold.com/hansalim` 다운로드 영역 바로 아래 | `review`를 채우기 전에는 보이지 않음 |

- 추천 주소(slug): `hansalim-ai-lecture-review` → `/blog/dev-story/hansalim-ai-lecture-review`
- 추천 제목: 「한살림성남용인에서 AI 업무활용·개인정보보호 교육을 하고 왔습니다」
- 태그: `AI교육` `개인정보보호` `AX` `Claude Code` `Codex` `강의후기`
- 다운로드 페이지는 검색에 노출하지 않지만(noindex) 후기 글은 노출한다. 검색에서 들어온 사람은 글 끝의 링크로 자료 페이지에 간다.

## 2. 글 구성

1. **어떤 교육이었나** — 기관, 날짜, 대상(부서·인원), 시간 구성(오전 이론 / 오후 실습). 한두 문단.
2. **오전: AI를 업무에 쓸 때의 기준** — 개인정보를 어디까지 넣어도 되는지, 가명처리가 왜 필요한지. 슬라이드 2~3장을 이미지로.
3. **오후 실습: 한 폴더로 끝까지** — `한살림_AI실습` 폴더 흐름
   - 손풀기(P00): VS Code에서 폴더 열기, 연결 확인
   - 업무 자동화(P01~P08): 가상 매장 엑셀 통합 집계 → 검증 → 1쪽 보고 → HTML·PPT
   - 연결(P09~P13): MCP로 지식보관함 찾기·공지 초안 저장
   - 개인정보(P14~P16): 가명처리 코드, 가명 자료로만 분석, 로컬 복구
   - 검수·재사용(P17~P19): 독립 검수, 스킬로 만들어 팀에 공유
4. **현장에서 막힌 곳과 푼 방법** — 설치·로그인·MCP 연결·PPT 글꼴 같은 실제 사례. 다음 교육 때 가장 쓸모 있는 부분이다.
5. **참가자 반응** — 동의를 받은 말만, 이름 없이(「총무 담당 A님」 수준까지만).
6. **다음에 바꿀 것** — 시간 배분, 미리 설치해 오게 할 것.
7. **자료** — 「교육 자료는 kscold.com/hansalim 에서 받을 수 있습니다.」 링크로 끝낸다.

말투는 블로그의 다른 개발 이야기 글처럼 합니다체로, 과장 없이 겪은 일 위주로 쓴다.

## 3. 사진·개인정보 기준 (이 교육의 주제이기도 하다)

- 참가자 얼굴·이름표·모니터 화면은 **동의를 받은 경우에만**, 그래도 얼굴은 뒷모습이나 흐림 처리.
- 실습 화면은 **가상 자료만** 보인다는 것을 확인하고 올린다. 실제 조합원·매장 데이터가 비치면 빼거나 가린다.
- 강사용 자료(대본·답안·시연키트·연결표)는 글에도 사진에도 넣지 않는다.
- 사진은 글 편집기의 이미지 올리기로 넣는다(블로그 저장소에 올라감). 가로 1600px 안팎으로 줄여서.
- 대표 이미지는 강의 표지 슬라이드나 현장 전경(얼굴이 안 보이는 것) 한 장.

## 4. 다운로드 페이지에 연결하기

글을 공개한 뒤 `apps/web/src/widgets/lecture/model/hansalimLecture.ts`의 `review`를 채운다.

```ts
review: {
  postPath: '/blog/dev-story/hansalim-ai-lecture-review',
  summary: '오전에는 AI를 업무에 쓸 때의 개인정보 기준을, 오후에는 가상 매장 자료로 집계·보고·가명처리까지 직접 해 봤습니다.',
  coverImage: '<글의 대표 이미지 주소>', // 없으면 빼도 된다
},
```

그다음 저장소 루트에서:

```bash
pnpm --dir apps/web lint && pnpm --dir apps/web type-check
pnpm --dir apps/web test:e2e:ci e2e/hansalim-downloads.spec.ts   # 후기 카드가 글로 이어지는지까지 확인
git commit -am "feat(frontend): 한살림 교육 다운로드 페이지에 후기 글 연결"   # 형식은 저장소 커밋 규칙을 따른다
git push origin main
./scripts/deploy-live-container.sh --frontend-only
```

`apps/web`에서 오래 켜 둔 `next dev`·`next start`가 있으면 빌드 폴더(`.next`)를 같이 써서 빌드가 깨질 수 있다. 그럴 때는 별도 작업 폴더(`git worktree`)에서 빌드·배포한다.

## 5. 시연 중 에이전트에게 맡길 때 쓸 요청문

```text
apps/web/docs/hansalim-review-guide.md 를 읽고 한살림 교육 후기를 준비해 줘.
1. 내가 주는 메모와 사진 목록으로 2장의 구성대로 초안을 써서 보여 줘. 아직 올리지는 마.
2. 3장 기준에 걸리는 사진이나 문장이 있으면 먼저 알려 줘.
3. 내가 확인하면 블로그 글로 공개하고, 4장대로 다운로드 페이지에 연결해서 배포해 줘.
4. 끝나면 글 주소와 kscold.com/hansalim 에서 후기 카드가 글로 이어지는지 확인한 결과를 알려 줘.
```

## 6. 자료를 다시 반영할 때

강의 저장소(`kscold/lecture`)에서 자료를 다시 빌드했으면 저장소 루트에서:

```bash
gh repo clone kscold/lecture /tmp/lecture -- --depth 1
node apps/web/scripts/sync-hansalim-downloads.mjs /tmp/lecture/downloads
pnpm --dir apps/web exec prettier --write src/widgets/lecture/model/hansalimDownloads.ts
```

- manifest의 sha256·크기·`release_id`가 파일과 하나라도 다르거나, 실습 ZIP에 글꼴(`included_fonts` 폴더의 .ttf 두 개와 OFL.txt)이 빠졌거나, 강사용으로 보이는 파일 이름이 섞이면 아무것도 바꾸지 않고 멈춘다.
- manifest의 `files`에 적힌 파일만 `public/hansalim/files`로 옮긴다. `hidden: true`인 파일(예전 글꼴 ZIP)은 옛 주소 호환용으로 파일만 두고 화면에는 그리지 않는다.
- 배포한 뒤 강의 저장소에서 `python3 downloads/검사도구/verify_downloads.py --base-url https://kscold.com/hansalim/files`로 운영 파일을 내려받아 크기·해시·장수를 확인한다(PyMuPDF 필요).
