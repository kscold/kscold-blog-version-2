import { randomUUID } from 'node:crypto';

// 세션 ID와 파일 이름은 그대로 경로에 붙는다. 정해진 모양이 아니면 받지 않아 폴더 밖을 가리킬 수 없게 한다.
const SESSION_ID = /^[a-z][a-z0-9_]{0,40}-(\d{13})-[0-9a-f]{8}$/;
const SCREENSHOT_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,100}\.png$/;

export function createSessionId(suiteId, now = Date.now()) {
  return `${suiteId}-${now}-${randomUUID().slice(0, 8)}`;
}

export function isSessionId(value) {
  return typeof value === 'string' && SESSION_ID.test(value);
}

export function isScreenshotName(value) {
  return typeof value === 'string' && SCREENSHOT_NAME.test(value);
}

/** ID에 담긴 시작 시각. 최근 세션을 고르거나 오래된 세션을 정리할 때 쓴다. */
export function sessionStartedAt(sessionId) {
  return Number(SESSION_ID.exec(sessionId)?.[1] ?? 0);
}
