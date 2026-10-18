#!/usr/bin/env node
// 강의 저장소(kscold/lecture, 비공개)의 downloads/ 폴더를 /hansalim 다운로드 페이지에 반영한다.
// 사용법: node apps/web/scripts/sync-hansalim-downloads.mjs <lecture 저장소의 downloads 폴더>
// manifest.json의 sha256과 다른 파일이 하나라도 있으면 아무것도 바꾸지 않고 멈춘다.
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC_DIR = path.join(APP_DIR, 'public/hansalim/files');
const DATA_FILE = path.join(APP_DIR, 'src/widgets/lecture/model/hansalimDownloads.ts');
// 공개 페이지에 올리면 안 되는 자료가 이름으로 섞여 들어오는 것을 막는다.
const FORBIDDEN_NAME = /강사|대본|답안|시연키트|연결표|instructor|answer/i;

const sourceDir = process.argv[2];
if (!sourceDir) {
  console.error('사용법: node apps/web/scripts/sync-hansalim-downloads.mjs <downloads 폴더>');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(path.join(sourceDir, 'manifest.json'), 'utf8'));
const files = [...manifest.files].sort((a, b) => a.order - b.order);

for (const item of files) {
  if (FORBIDDEN_NAME.test(item.file) || item.file.includes('/') || item.file.includes('..')) {
    throw new Error(`공개할 수 없는 파일 이름입니다: ${item.file}`);
  }
  const bytes = fs.readFileSync(path.join(sourceDir, item.file));
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  if (sha256 !== item.sha256 || bytes.length !== item.bytes) {
    throw new Error(`manifest와 다른 파일입니다: ${item.file}`);
  }
}

// 검사를 모두 통과한 뒤에만 바꾼다. 예전 빌드의 파일은 지워 이름이 바뀌어도 남지 않게 한다.
fs.rmSync(PUBLIC_DIR, { recursive: true, force: true });
fs.mkdirSync(PUBLIC_DIR, { recursive: true });
for (const item of files) {
  fs.copyFileSync(path.join(sourceDir, item.file), path.join(PUBLIC_DIR, item.file));
  // 강의 저장소의 파일은 소유자만 읽을 수 있게 받아질 수 있다. 공개 정적 파일로 읽히도록 권한을 맞춘다.
  fs.chmodSync(path.join(PUBLIC_DIR, item.file), 0o644);
}

const data = files.map(({ order, key, primary, title, description, note, file, bytes, size, format, sha256 }) => ({
  order, key, primary: Boolean(primary), title, description, ...(note ? { note } : {}), file, bytes, size, format, sha256,
}));
fs.writeFileSync(
  DATA_FILE,
  `// 이 파일은 scripts/sync-hansalim-downloads.mjs가 강의 저장소의 manifest.json으로 만든다. 직접 고치지 않는다.\n` +
    `export const HANSALIM_DOWNLOADS = ${JSON.stringify(data, null, 2)} as const;\n\n` +
    `export type HansalimDownload = (typeof HANSALIM_DOWNLOADS)[number];\n`
);
console.log(`반영 완료: ${files.length}개 파일 → public/hansalim/files`);
for (const item of files) console.log(`  ${item.order}. ${item.file} (${item.size}) ${item.sha256.slice(0, 12)}`);
