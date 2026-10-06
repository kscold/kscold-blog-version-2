const LINE = /^(\S+) .*?host=(\S+) method=(\S+) uri=(\S+) status=(\d{3}) .*?crawler=(\S+)/;

/** 확인하고 싶은 파일을 어떤 크롤러가 가져갔는지 따로 본다. 광고·색인 등록 상태를 판단하는 근거다. */
const WATCHED_URIS = ['/ads.txt', '/robots.txt', '/sitemap.xml', '/rss.xml', '/llms.txt'];

function emptySummary() {
  return { hits: 0, pages: new Set(), errors: 0, lastSeenAt: '', watched: {} };
}

/**
 * Nginx 접근 로그에서 검색·AI·광고 크롤러의 방문만 종류별로 센다.
 * 로그에는 크롤러 종류만 남고 일반 방문자는 "-"라서, 사람의 방문 기록은 집계하지 않는다.
 */
export function summarizeCrawlers(logText, { hosts, since }) {
  const summaries = new Map();
  for (const line of logText.split('\n')) {
    const match = LINE.exec(line);
    if (!match) continue;
    const [, at, host, , uri, status, crawler] = match;
    if (crawler === '-' || !hosts.includes(host) || Date.parse(at) < since) continue;

    const summary = summaries.get(crawler) ?? emptySummary();
    summary.hits += 1;
    summary.pages.add(uri);
    if (Number(status) >= 400) summary.errors += 1;
    if (at > summary.lastSeenAt) summary.lastSeenAt = at;
    if (WATCHED_URIS.includes(uri)) summary.watched[uri] = Number(status);
    summaries.set(crawler, summary);
  }
  return [...summaries.entries()]
    .map(([crawler, summary]) => ({
      crawler,
      hits: summary.hits,
      pages: summary.pages.size,
      errors: summary.errors,
      lastSeenAt: summary.lastSeenAt,
      watched: summary.watched,
    }))
    .sort((left, right) => right.hits - left.hits);
}
