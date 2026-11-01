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

const formatRow = row =>
  `${decodeURI(row.key.replace('https://kscold.com', '') || '/')} — 클릭 ${row.clicks}, 노출 ${row.impressions}, 평균 ${row.position}위`;

function searchConsoleSection(searchConsole) {
  if (!searchConsole) return ['- 서비스 계정이 없어 건너뜀'];
  if (searchConsole.error) return [`- 조회 실패 (${searchConsole.error})`];
  const { sitemap, coverage, performance, inspectedToday } = searchConsole;
  const states = Object.entries(coverage.byCoverage)
    .sort(([, left], [, right]) => right - left)
    .map(([label, count]) => `  - ${label}: ${count}`);
  return [
    `- 사이트맵: 구글이 아는 URL ${sitemap.submitted}개, 마지막으로 읽은 시각 ${sitemap.lastDownloaded ?? '없음'} (${sitemap.action})`,
    `- 색인: ${coverage.indexed}/${coverage.total}개 (오늘 검사 ${inspectedToday}개, 아직 못 본 URL ${coverage.unchecked}개)`,
    ...states,
    `- 검색 실적 ${performance.startDate}~${performance.endDate}: 클릭 ${performance.clicks}, 노출 ${performance.impressions}`,
    ...(performance.pages.length
      ? ['- 많이 노출된 페이지', ...performance.pages.map(row => `  - ${formatRow(row)}`)]
      : []),
    ...(performance.queries.length
      ? ['- 많이 노출된 검색어', ...performance.queries.map(row => `  - ${formatRow(row)}`)]
      : []),
  ];
}

const toPath = url => decodeURI(url.replace('https://kscold.com', '') || '/');

function nameSearchSection(searchConsole) {
  if (!searchConsole) return ['- 서비스 계정이 없어 건너뜀'];
  if (searchConsole.error) return [`- 조회 실패 (${searchConsole.error})`];
  const { posts, nameSearch } = searchConsole;
  const lines = [`- 블로그 글 색인: ${posts.indexed}/${posts.total}개 (아직 못 본 글 ${posts.unchecked}개)`];
  if (nameSearch.error) return [...lines, `- 이름 검색어 조회 실패 (${nameSearch.error})`];
  if (nameSearch.rows.length === 0) {
    return [
      ...lines,
      `- ${nameSearch.startDate}~${nameSearch.endDate}: 이름(김승찬·kscold)이 들어간 검색어로 노출된 기록이 아직 없음`,
    ];
  }
  return [
    ...lines,
    `- ${nameSearch.startDate}~${nameSearch.endDate} 이름이 들어간 검색어`,
    ...nameSearch.rows.map(
      row =>
        `  - "${row.query}" → ${toPath(row.page)} — 노출 ${row.impressions}, 클릭 ${row.clicks}, 평균 ${row.position}위`
    ),
  ];
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
    '## 구글 서치 콘솔',
    ...searchConsoleSection(result.searchConsole),
    '',
    '## 이름 검색 (구글)',
    ...nameSearchSection(result.searchConsole),
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
    ...(result.searchConsole && !result.searchConsole.error
      ? {
          indexed: result.searchConsole.coverage.indexed,
          clicks: result.searchConsole.performance.clicks,
          impressions: result.searchConsole.performance.impressions,
          postsIndexed: result.searchConsole.posts.indexed,
          ...nameSearchHistory(result.searchConsole.nameSearch),
        }
      : {}),
  };
}

/** 이름 검색어 추이는 노출 합계와 가장 좋은 순위만 남긴다. */
function nameSearchHistory(nameSearch) {
  if (!nameSearch || nameSearch.error) return {};
  const rows = nameSearch.rows;
  return {
    nameImpressions: rows.reduce((sum, row) => sum + row.impressions, 0),
    nameBestPosition: rows.length ? Math.min(...rows.map(row => row.position)) : null,
  };
}
