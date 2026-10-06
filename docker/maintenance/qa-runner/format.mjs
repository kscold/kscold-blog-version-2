const LOG_LIMIT = 400;
const ANSI = /\u001b\[[0-9;]*m/g;

// 로그는 운영자가 읽는 한국 시각으로 찍는다. 로캘에 따라 '15시 39분'처럼 풀어 쓰지 않도록 숫자 표기를 고정한다.
const CLOCK = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
  timeZone: 'Asia/Seoul',
});
const clock = date => CLOCK.format(date);

/** 로그 한 줄에 시각을 붙여 쌓고, 화면에 실어 보낼 만큼만 남긴다. */
export function appendLog(logs, text, at) {
  logs.push(`${clock(at)} ${text}`);
  if (logs.length > LOG_LIMIT) logs.splice(0, logs.length - LOG_LIMIT);
}

/** 출력은 줄 중간에서 끊겨 들어온다. 줄이 끝난 것만 넘기고 나머지는 다음 조각과 이어 붙인다. */
export function lineReader(onLine) {
  let rest = '';
  return chunk => {
    const lines = (rest + chunk.toString()).split(/\r?\n/);
    rest = lines.pop() ?? '';
    for (const line of lines) {
      const text = line.replace(ANSI, '').trimEnd();
      if (text.trim()) onLine(text);
    }
  };
}

/** 폴더에 남기는 기록. 실행 중인 프로세스 같은 내부 상태는 빼고 결과만 담는다. */
export function toManifest(session, screenshotNames, storedAt) {
  return {
    id: session.id,
    suiteId: session.suiteId,
    suiteLabel: session.suiteLabel,
    status: session.status,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    exitCode: session.exitCode,
    logs: session.logs,
    screenshotNames,
    storedAt,
  };
}

/** 어드민 화면이 받는 모양. 스크린샷은 러너의 주소로 바꿔 내보낸다. */
export function toPublicSession(session, screenshotNames) {
  const urlOf = name => `/artifacts/${session.id}/screenshots/${encodeURIComponent(name)}`;
  const latest = screenshotNames.at(-1);
  return {
    id: session.id,
    suiteId: session.suiteId,
    suiteLabel: session.suiteLabel,
    status: session.status,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    exitCode: session.exitCode,
    logs: session.logs,
    screenshots: screenshotNames.map(name => ({ name, url: urlOf(name) })),
    latestScreenshotUrl: latest ? urlOf(latest) : null,
  };
}
