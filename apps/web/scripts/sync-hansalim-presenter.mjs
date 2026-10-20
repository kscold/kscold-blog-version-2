#!/usr/bin/env node
// 강의 저장소(kscold/lecture, 비공개)의 강사용 PDF와 장별 대본을 /hansalim/presenter(강사 발표 화면)에 쓸 수 있게 옮긴다.
// 사용법: node apps/web/scripts/sync-hansalim-presenter.mjs <lecture 저장소의 output/한살림_AI교육_초안스타일_YYYY-MM-DD 폴더>
// 결과는 apps/web/private/hansalim-presenter/에 쓴다. 이 폴더는 Git에서 제외되고 배포 파일에만 들어간다(블로그 저장소는 공개).
// 장 수와 PDF 쪽 수가 다르거나 대본이 빈 장이 있으면 아무것도 바꾸지 않고 멈춘다.
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(APP_DIR, 'private/hansalim-presenter');
const LAYOUT_FILE = '레이아웃.json';
const DECK_PATTERN = /^한살림성남용인_AI교육_.*\.pdf$/;

// 발표 화면에 쓰는 값만 옮긴다. 그림 좌표·카드 내용 같은 그리기용 값은 PDF에 이미 들어 있다.
const FIELDS = {
  number: 'number',
  title: 'title',
  sub: 'sub',
  time: 'time',
  minutes: 'minutes',
  part: 'part',
  session: 'session',
  script: 'script',
  activity: 'activity',
  answer: 'answer',
  success: 'success',
  prompt: 'prompt',
};

/** PDF 쪽 수를 센다. 쪽 객체(/Type /Page)만 세고 쪽 묶음(/Type /Pages)은 뺀다. */
function countPdfPages(bytes) {
  return (bytes.toString('latin1').match(/\/Type\s*\/Page(?![a-z])/g) ?? []).length;
}

function main() {
  const sourceDir = process.argv[2];
  if (!sourceDir) throw new Error('강의 저장소 output 아래 자료 폴더 경로를 넘겨 주세요.');

  const layout = JSON.parse(fs.readFileSync(path.join(sourceDir, LAYOUT_FILE), 'utf8'));
  const deckName = fs.readdirSync(sourceDir).find(name => DECK_PATTERN.test(name.normalize('NFC')));
  if (!deckName) throw new Error(`강사용 PDF(${DECK_PATTERN})를 찾지 못했습니다.`);
  const deck = fs.readFileSync(path.join(sourceDir, deckName));

  const slides = layout.map(({ slide }, index) => {
    const item = Object.fromEntries(
      Object.entries(FIELDS).map(([key, field]) => [key, String(slide[field] ?? '').trim()])
    );
    item.number = Number.parseInt(item.number, 10);
    item.minutes = Number.parseFloat(item.minutes) || 0;
    item.instructorOnly = Boolean(slide.instructor_only);
    if (item.number !== index + 1)
      throw new Error(`${index + 1}번째 장의 번호가 ${item.number}입니다.`);
    if (!item.script) throw new Error(`${item.number}장에 대본이 없습니다.`);
    return item;
  });

  const pages = countPdfPages(deck);
  if (pages !== slides.length) {
    throw new Error(`강사용 PDF는 ${pages}쪽인데 대본은 ${slides.length}장입니다.`);
  }

  const deckSha256 = createHash('sha256').update(deck).digest('hex');
  const data = {
    deckSha256,
    deckBytes: deck.length,
    syncedAt: new Date().toISOString(),
    slides,
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, 'deck.pdf'), deck);
  fs.writeFileSync(path.join(OUT_DIR, 'slides.json'), `${JSON.stringify(data, null, 2)}\n`);
  console.log(
    `강사 발표 화면 자료 ${slides.length}장, PDF ${(deck.length / 1024 / 1024).toFixed(1)}MB (${deckSha256.slice(0, 12)})`
  );
}

main();
