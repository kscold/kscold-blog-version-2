import { createSign } from 'node:crypto';

const API = 'https://searchconsole.googleapis.com';
const SCOPE = 'https://www.googleapis.com/auth/webmasters';
const DAY_MS = 86_400_000;
// URL 검사 API는 속성마다 하루 2,000건까지라, 매일 일부만 돌려 며칠에 걸쳐 전체를 한 바퀴 돈다.
export const INSPECT_BATCH = 150;
const INSPECT_CONCURRENCY = 3;
// 사이트맵을 이만큼 오래 안 읽어 가면 다시 제출해 알린다.
const SITEMAP_STALE_MS = 7 * DAY_MS;
const TOP_ROWS = 10;
// 서치 콘솔 실적은 2~3일 늦게 채워진다.
const ANALYTICS_LAG_DAYS = 3;
const ANALYTICS_DAYS = 28;

const base64Url = value => Buffer.from(value).toString('base64url');

/** 서비스 계정 키로 서명한 JWT를 액세스 토큰으로 바꾼다. 외부 라이브러리 없이 RS256으로 직접 서명한다. */
export async function createAccessToken({ account, fetcher, now = Date.now() }) {
  const issuedAt = Math.floor(now / 1000);
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64Url(
    JSON.stringify({
      iss: account.client_email,
      scope: SCOPE,
      aud: account.token_uri,
      iat: issuedAt,
      exp: issuedAt + 3600,
    })
  );
  const signature = createSign('RSA-SHA256')
    .update(`${header}.${claims}`)
    .sign(account.private_key)
    .toString('base64url');
  const response = await fetcher(account.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${header}.${claims}.${signature}`,
    }).toString(),
  });
  if (!response.ok) throw new Error(`토큰 발급 실패 HTTP ${response.status}`);
  return (await response.json()).access_token;
}

/**
 * 오늘 검사할 URL을 고른다. 한 번도 안 본 URL, 아직 색인되지 않은 URL, 색인된 URL 순으로,
 * 같은 묶음 안에서는 오래전에 본 것부터 고른다.
 */
export function pickInspectionBatch(urls, statuses, size = INSPECT_BATCH) {
  const rank = url => {
    const status = statuses[url];
    if (!status) return 0;
    return status.verdict === 'PASS' ? 2 : 1;
  };
  return [...urls]
    .sort(
      (left, right) =>
        rank(left) - rank(right) ||
        (statuses[left]?.checkedAt ?? '').localeCompare(statuses[right]?.checkedAt ?? '')
    )
    .slice(0, size);
}

/** 사이트맵에 있는 URL의 마지막 검사 결과를 상태별로 센다. 아직 못 본 URL은 따로 센다. */
export function summarizeCoverage(urls, statuses) {
  const byCoverage = {};
  let indexed = 0;
  let unchecked = 0;
  for (const url of urls) {
    const status = statuses[url];
    if (!status) {
      unchecked += 1;
      continue;
    }
    if (status.verdict === 'PASS') indexed += 1;
    const label = status.coverage || '알 수 없음';
    byCoverage[label] = (byCoverage[label] ?? 0) + 1;
  }
  return { total: urls.length, indexed, unchecked, byCoverage };
}

/** 구글이 들고 있는 URL 수가 사이트맵과 다르거나 오래 안 읽어 갔으면 다시 제출한다. */
export function shouldResubmitSitemap(sitemap, sitemapCount, now) {
  if (!sitemap) return true;
  const submitted = Number(sitemap.contents?.find(item => item.type === 'web')?.submitted ?? 0);
  const downloadedAt = Date.parse(sitemap.lastDownloaded ?? '') || 0;
  return submitted !== sitemapCount || now - downloadedAt > SITEMAP_STALE_MS;
}

function createClient({ token, fetcher }) {
  return async (method, path, body) => {
    const response = await fetcher(`${API}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) throw new Error(`${method} ${path.split('?')[0]} HTTP ${response.status}`);
    return response.status === 204 ? null : response.json();
  };
}

async function inspectAll(call, property, urls, now) {
  const results = {};
  const queue = [...urls];
  const worker = async () => {
    while (queue.length > 0) {
      const url = queue.shift();
      try {
        const data = await call('POST', '/v1/urlInspection/index:inspect', {
          inspectionUrl: url,
          siteUrl: property,
          languageCode: 'ko',
        });
        const status = data.inspectionResult?.indexStatusResult ?? {};
        results[url] = {
          verdict: status.verdict,
          coverage: status.coverageState,
          lastCrawl: status.lastCrawlTime,
          checkedAt: new Date(now).toISOString(),
        };
      } catch {
        // 한도에 걸리거나 일시 오류가 난 URL은 다음 실행에서 다시 고른다.
      }
    }
  };
  await Promise.all(Array.from({ length: INSPECT_CONCURRENCY }, worker));
  return results;
}

function dateDaysAgo(now, days) {
  return new Date(now - days * DAY_MS).toISOString().slice(0, 10);
}

async function loadPerformance(call, encodedProperty, now) {
  const range = {
    startDate: dateDaysAgo(now, ANALYTICS_LAG_DAYS + ANALYTICS_DAYS - 1),
    endDate: dateDaysAgo(now, ANALYTICS_LAG_DAYS),
  };
  const query = body =>
    call('POST', `/webmasters/v3/sites/${encodedProperty}/searchAnalytics/query`, body);
  const [total, pages, queries] = await Promise.all([
    query(range),
    query({ ...range, dimensions: ['page'], rowLimit: TOP_ROWS }),
    query({ ...range, dimensions: ['query'], rowLimit: TOP_ROWS }),
  ]);
  const toRow = row => ({
    key: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions,
    position: Math.round(row.position * 10) / 10,
  });
  const totals = total.rows?.[0] ?? { clicks: 0, impressions: 0 };
  return {
    ...range,
    clicks: totals.clicks,
    impressions: totals.impressions,
    pages: (pages.rows ?? []).map(toRow),
    queries: (queries.rows ?? []).map(toRow),
  };
}

/**
 * 서치 콘솔에서 사이트맵 상태·색인 현황·검색 실적을 읽는다.
 * 실제 실행(apply)일 때만 사이트맵을 다시 제출하고 URL 검사를 돌린다. 미리보기는 읽기만 한다.
 */
export async function checkSearchConsole({
  account,
  property,
  sitemapUrl,
  urls,
  statuses,
  apply,
  fetcher,
  now = Date.now(),
}) {
  const token = await createAccessToken({ account, fetcher, now });
  const call = createClient({ token, fetcher });
  const encodedProperty = encodeURIComponent(property);
  const sitemapPath = `/webmasters/v3/sites/${encodedProperty}/sitemaps/${encodeURIComponent(sitemapUrl)}`;

  let sitemap = null;
  try {
    sitemap = await call('GET', sitemapPath);
  } catch {
    sitemap = null;
  }
  const resubmit = shouldResubmitSitemap(sitemap, urls.length, now);
  let sitemapAction = resubmit ? '다시 제출 필요' : '그대로 둠';
  if (apply && resubmit) {
    await call('PUT', sitemapPath);
    sitemapAction = '다시 제출함';
  }

  const kept = Object.fromEntries(Object.entries(statuses).filter(([url]) => urls.includes(url)));
  const inspected = apply
    ? await inspectAll(call, property, pickInspectionBatch(urls, kept), now)
    : {};
  const nextStatuses = { ...kept, ...inspected };

  return {
    sitemap: {
      lastDownloaded: sitemap?.lastDownloaded ?? null,
      submitted: Number(sitemap?.contents?.find(item => item.type === 'web')?.submitted ?? 0),
      action: sitemapAction,
    },
    inspectedToday: Object.keys(inspected).length,
    coverage: summarizeCoverage(urls, nextStatuses),
    performance: await loadPerformance(call, encodedProperty, now),
    nextStatuses,
  };
}
