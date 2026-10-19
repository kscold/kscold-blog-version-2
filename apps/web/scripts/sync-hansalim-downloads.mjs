#!/usr/bin/env node
// 강의 저장소(kscold/lecture, 비공개)의 downloads/ 폴더를 /hansalim 다운로드 페이지에 반영한다.
// 사용법: node apps/web/scripts/sync-hansalim-downloads.mjs <lecture 저장소의 downloads 폴더>
// manifest.json과 다른 파일이 하나라도 있거나 실습 ZIP에 글꼴이 빠졌으면 아무것도 바꾸지 않고 멈춘다.
// 운영 서버는 이 폴더를 읽지 않는다. 여기서 복사한 public/hansalim/files가 Git에 들어가 같은 빌드로 배포된다.
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC_DIR = path.join(APP_DIR, 'public/hansalim/files');
const DATA_FILE = path.join(APP_DIR, 'src/widgets/lecture/model/hansalimDownloads.ts');
// 공개 페이지에 올리면 안 되는 자료가 이름으로 섞여 들어오는 것을 막는다.
const FORBIDDEN_NAME = /강사|대본|답안|시연키트|연결표|instructor|answer/i;

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

/** 강의 저장소의 verify_downloads.py와 같은 방식(파일 이름순 「이름:해시」 줄의 해시 앞 16자)으로 자료 묶음 버전을 만든다. */
function releaseIdOf(files) {
  const lines = files
    .map(item => `${item.file}:${item.sha256}`)
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  return sha256(Buffer.from(lines.join('\n'), 'utf8')).slice(0, 16);
}

/** ZIP 끝의 중앙 디렉터리만 읽어 안에 든 경로를 돌려준다. 압축은 풀지 않는다. */
function listZipEntries(bytes) {
  const end = bytes.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (end < 0) throw new Error('ZIP 끝 정보를 찾지 못했습니다');
  const count = bytes.readUInt16LE(end + 10);
  let offset = bytes.readUInt32LE(end + 16);
  const names = [];
  for (let index = 0; index < count; index += 1) {
    if (bytes.readUInt32LE(offset) !== 0x02014b50) throw new Error('ZIP 목록이 깨졌습니다');
    const nameLength = bytes.readUInt16LE(offset + 28);
    const name = bytes.toString('utf8', offset + 46, offset + 46 + nameLength);
    names.push(name.normalize('NFC'));
    offset += 46 + nameLength + bytes.readUInt16LE(offset + 30) + bytes.readUInt16LE(offset + 32);
  }
  return names;
}

/** 글꼴을 담았다고 적힌 ZIP에 .ttf 두 개 이상과 라이선스가 실제로 들어 있는지 본다. 빠졌으면 반영하지 않는다. */
function assertBundledFonts(item, bytes) {
  const folder = `${item.included_fonts.replace(/\/$/, '')}/`;
  const names = listZipEntries(bytes).filter(name => name.startsWith(folder));
  const fonts = names.filter(name => name.toLowerCase().endsWith('.ttf'));
  if (fonts.length < 2 || !names.includes(`${folder}OFL.txt`)) {
    throw new Error(`${item.file}에 글꼴 또는 라이선스가 빠졌습니다: ${folder}`);
  }
}

function readVerifiedManifest(sourceDir) {
  const manifest = JSON.parse(fs.readFileSync(path.join(sourceDir, 'manifest.json'), 'utf8'));
  const files = [...manifest.files].sort((a, b) => a.order - b.order);
  for (const item of files) {
    if (FORBIDDEN_NAME.test(item.file) || item.file.includes('/') || item.file.includes('..')) {
      throw new Error(`공개할 수 없는 파일 이름입니다: ${item.file}`);
    }
    const bytes = fs.readFileSync(path.join(sourceDir, item.file));
    if (sha256(bytes) !== item.sha256 || bytes.length !== item.bytes) {
      throw new Error(`manifest와 다른 파일입니다: ${item.file}`);
    }
    if (item.included_fonts) assertBundledFonts(item, bytes);
  }
  if (releaseIdOf(files) !== manifest.release_id) {
    throw new Error(`release_id가 파일 해시와 맞지 않습니다: ${manifest.release_id}`);
  }
  if (!Number.isInteger(manifest.slides) || manifest.slides <= 0) {
    throw new Error(`슬라이드 수가 올바르지 않습니다: ${manifest.slides}`);
  }
  if (!files.some(item => item.primary && !item.hidden))
    throw new Error('화면에 보일 실습 자료가 없습니다');
  return { manifest, files };
}

// 화면에 쓰는 값만 옮긴다. hidden 자료(예전 글꼴 ZIP)는 옛 주소 호환용으로 파일만 두고 화면에는 그리지 않는다.
function toDownloadData({
  order,
  key,
  primary,
  hidden,
  title,
  description,
  file,
  bytes,
  size,
  format,
  sha256: hash,
}) {
  return {
    order,
    key,
    primary: Boolean(primary),
    hidden: Boolean(hidden),
    title,
    description,
    file,
    bytes,
    size,
    format,
    sha256: hash,
  };
}

function writeData(manifest, files) {
  const release = { releaseId: manifest.release_id, slides: manifest.slides };
  fs.writeFileSync(
    DATA_FILE,
    `// 이 파일은 scripts/sync-hansalim-downloads.mjs가 강의 저장소의 manifest.json으로 만든다. 직접 고치지 않는다.\n` +
      `export const HANSALIM_RELEASE = ${JSON.stringify(release, null, 2)} as const;\n\n` +
      `export const HANSALIM_DOWNLOADS = ${JSON.stringify(files.map(toDownloadData), null, 2)} as const;\n\n` +
      `export type HansalimDownload = (typeof HANSALIM_DOWNLOADS)[number];\n`
  );
}

const sourceDir = process.argv[2];
if (!sourceDir) {
  console.error('사용법: node apps/web/scripts/sync-hansalim-downloads.mjs <downloads 폴더>');
  process.exit(1);
}

const { manifest, files } = readVerifiedManifest(sourceDir);

// 검사를 모두 통과한 뒤에만 바꾼다. 예전 빌드의 파일은 지워 이름이 바뀌어도 남지 않게 한다.
// manifest의 files에 적힌 파일만 옮기고 README·요청문·검사 도구는 공개 폴더에 넣지 않는다.
fs.rmSync(PUBLIC_DIR, { recursive: true, force: true });
fs.mkdirSync(PUBLIC_DIR, { recursive: true });
for (const item of files) {
  fs.copyFileSync(path.join(sourceDir, item.file), path.join(PUBLIC_DIR, item.file));
  // 강의 저장소의 파일은 소유자만 읽을 수 있게 받아질 수 있다. 공개 정적 파일로 읽히도록 권한을 맞춘다.
  fs.chmodSync(path.join(PUBLIC_DIR, item.file), 0o644);
}
writeData(manifest, files);

console.log(
  `반영 완료: release ${manifest.release_id} · ${manifest.slides}장 · ${files.length}개 파일 → public/hansalim/files`
);
for (const item of files) {
  console.log(
    `  ${item.order}. ${item.file} (${item.size})${item.hidden ? ' [숨김]' : ''} ${item.sha256.slice(0, 12)}`
  );
}
