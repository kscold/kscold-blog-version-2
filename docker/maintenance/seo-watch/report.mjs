const WATCHED_LABEL = uri => uri.replace(/^\//, '');

function healthSection(health) {
  const failed = health.filter(item => item.problems.length > 0);
  if (failed.length === 0) return [`- 점검한 ${health.length}곳 모두 정상`];
  return failed.map(item => `- ${item.target}: ${item.problems.join(', ')}`);
}

function indexNowSection(indexNow) {
  if (indexNow.urls.length === 0) return ['- 바뀐 URL 없음'];
  const lines = [`- 바뀐 URL ${indexNow.changed}개, 목록 화면 포함 ${indexNow.urls.length}개 대상`];
  if (indexNow.dryRun) return [...lines, '- 미리보기 실행이라 요청하지 않음'];
  return [
    ...lines,
    ...indexNow.responses.map(response => `- ${response.endpoint}: ${response.outcome}`),
  ];
}

function crawlerSection(crawlers) {
  if (crawlers === null) return ['- 접근 로그를 읽지 못함'];
  if (crawlers.length === 0) return ['- 지난 24시간 동안 다녀간 크롤러 없음'];
  return crawlers.map(item => {
    const watched = Object.entries(item.watched)
      .map(([uri, status]) => `${WATCHED_LABEL(uri)} ${status}`)
      .join(', ');
    const errors = item.errors > 0 ? `, 오류 응답 ${item.errors}건` : '';
    const files = watched ? ` | 확인한 파일: ${watched}` : '';
    return `- ${item.crawler}: ${item.hits}회, 서로 다른 주소 ${item.pages}개${errors}${files}`;
  });
}

function rankSection(ranks) {
  if (ranks.length === 0) return ['- 검색 API 키가 없어 건너뜀'];
  return ranks.map(item => {
    if (item.error) return `- ${item.engine} "${item.query}": 조회 실패 (${item.error})`;
    const position = item.position ? `${item.position}위` : `${item.depth}위 밖`;
    return `- ${item.engine} "${item.query}": ${position}`;
  });
}

/** 하루치 점검 결과를 사람이 훑어볼 수 있는 마크다운으로 정리한다. */
export function renderReport(result) {
  return [
    `# 검색 노출 점검 ${result.date}`,
    '',
    `대상: ${result.site} · 사이트맵 URL ${result.sitemapCount}개`,
    '',
    '## 상태 점검',
    ...healthSection(result.health),
    '',
    '## 색인 요청 (IndexNow)',
    ...indexNowSection(result.indexNow),
    '',
    '## 크롤러 방문 (지난 24시간)',
    ...crawlerSection(result.crawlers),
    '',
    '## 검색 순위',
    ...rankSection(result.ranks),
    '',
  ].join('\n');
}

/** 추이를 볼 수 있게 한 줄짜리 기록으로 줄인다. */
export function toHistoryRecord(result) {
  return {
    at: result.at,
    sitemapCount: result.sitemapCount,
    problems: result.health.filter(item => item.problems.length > 0).length,
    submitted: result.indexNow.dryRun ? 0 : result.indexNow.urls.length,
    crawlers: Object.fromEntries((result.crawlers ?? []).map(item => [item.crawler, item.hits])),
    ranks: result.ranks
      .filter(item => !item.error)
      .map(({ engine, query, position }) => ({
        engine,
        query,
        position,
      })),
  };
}
