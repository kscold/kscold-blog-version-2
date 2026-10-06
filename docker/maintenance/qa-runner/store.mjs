import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { isScreenshotName, isSessionId, sessionStartedAt } from './ids.mjs';

const PNG_END = Buffer.from([0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82]);
const MANIFEST = 'manifest.json';

export const sessionDir = (root, sessionId) => join(root, sessionId);
export const screenshotDir = (root, sessionId) => join(root, sessionId, 'screenshots');

/** 브라우저가 아직 쓰고 있는 파일을 내주면 깨진 그림이 화면에 남는다. 끝까지 기록된 PNG만 센다. */
async function isCompletePng(path) {
  const handle = await fs.open(path, 'r');
  try {
    const { size } = await handle.stat();
    if (size < PNG_END.length) return false;
    const tail = Buffer.alloc(PNG_END.length);
    await handle.read(tail, 0, tail.length, size - tail.length);
    return tail.equals(PNG_END);
  } finally {
    await handle.close();
  }
}

export async function listScreenshots(root, sessionId) {
  let names;
  try {
    names = await fs.readdir(screenshotDir(root, sessionId));
  } catch {
    return [];
  }
  const complete = [];
  for (const name of names.filter(isScreenshotName).sort()) {
    const ready = await isCompletePng(join(screenshotDir(root, sessionId), name)).catch(
      () => false
    );
    if (ready) complete.push(name);
  }
  return complete;
}

/** 읽는 쪽이 쓰다 만 내용을 보지 않도록 임시 파일에 쓴 뒤 이름을 바꾼다. */
export async function writeManifest(root, manifest) {
  const directory = sessionDir(root, manifest.id);
  await fs.mkdir(directory, { recursive: true });
  const temporary = join(directory, `${MANIFEST}.tmp`);
  await fs.writeFile(temporary, JSON.stringify(manifest, null, 2), 'utf8');
  await fs.rename(temporary, join(directory, MANIFEST));
}

export async function readManifest(root, sessionId) {
  try {
    return JSON.parse(await fs.readFile(join(sessionDir(root, sessionId), MANIFEST), 'utf8'));
  } catch {
    return null;
  }
}

/** 보관된 세션 ID를 최근 것부터 돌려준다. */
export async function listSessionIds(root) {
  let entries;
  try {
    entries = await fs.readdir(root, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries
    .filter(entry => entry.isDirectory() && isSessionId(entry.name))
    .map(entry => entry.name)
    .sort((left, right) => sessionStartedAt(right) - sessionStartedAt(left));
}

export async function removeSession(root, sessionId) {
  await fs.rm(sessionDir(root, sessionId), { recursive: true, force: true });
}

/** 최근 keep개만 남기고 오래된 세션 폴더를 지운다. 지운 ID를 돌려준다. */
export async function pruneSessions(root, keep) {
  const stale = (await listSessionIds(root)).slice(keep);
  for (const sessionId of stale) await removeSession(root, sessionId);
  return stale;
}

/** 스크린샷 파일의 실제 경로. 요청값이 정해진 모양이 아니면 null을 돌려준다. */
export function resolveScreenshot(root, sessionId, name) {
  if (!isSessionId(sessionId) || !isScreenshotName(name)) return null;
  return join(screenshotDir(root, sessionId), name);
}

/**
 * 실패한 실행이 남긴 마지막 화면을 찾아 스크린샷 목록의 맨 뒤에 붙인다.
 * 원본이 있던 실행 산출물 폴더는 더 쓸 일이 없어 함께 지운다.
 */
export async function collectFailureScreenshot(root, sessionId, outputDir) {
  const found = await findFile(outputDir, name => /^test-failed-\d+\.png$/.test(name));
  if (found) {
    await fs.mkdir(screenshotDir(root, sessionId), { recursive: true });
    await fs.copyFile(found, join(screenshotDir(root, sessionId), '99-failure.png'));
  }
  await fs.rm(outputDir, { recursive: true, force: true });
  return Boolean(found);
}

async function findFile(directory, matches) {
  let entries;
  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch {
    return null;
  }
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isFile() && matches(entry.name)) return path;
    if (entry.isDirectory()) {
      const nested = await findFile(path, matches);
      if (nested) return nested;
    }
  }
  return null;
}
