import assert from 'node:assert/strict';
import { test } from 'node:test';
import { runWatch } from './seo-watch.mjs';
import { summarizeCrawlers } from './seo-watch/crawlers.mjs';
import { findFileProblems, findPageProblems } from './seo-watch/health.mjs';
import { submitIndexNow } from './seo-watch/indexnow.mjs';
import { checkRanks, findPosition } from './seo-watch/rank.mjs';
import { renderReport } from './seo-watch/report.mjs';
import { parseSitemap, planIndexNow, toSubmittedState } from './seo-watch/sitemap.mjs';

const SITE = 'https://kscold.com';
const NOW = Date.parse('2026-10-06T03:00:00Z');
const KEY = 'a'.repeat(32);

const sitemapXml = entries =>
  `<urlset>${entries
    .map(
      ([path, lastmod]) =>
        `<url><loc>${SITE}${path}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`
    )
    .join('')}</urlset>`;

const pageHtml = url => `<html><head><title>글</title>
<meta name="description" content="설명"/><link rel="canonical" href="${url}"/>
<script type="application/ld+json">{"@type":"WebPage"}</script></head><body><h1>글</h1></body></html>`;

const FILE_BODIES = {
  '/robots.txt': 'User-Agent: *\nAllow: /\nSitemap: https://kscold.com/sitemap.xml',
  '/rss.xml': '<rss><item></item></rss>',
  '/ads.txt': 'google.com, pub-1234567890, DIRECT, f08c47fec0942fa0',
  '/llms.txt': '# 소개',
  [`/${KEY}.txt`]: KEY,
};

/** 운영 사이트와 검색엔진 수신 주소를 흉내 내는 가짜 fetch. 보낸 색인 요청은 posts에 쌓인다. */
function fakeWeb(entries, { indexNowStatus = 200 } = {}) {
  const posts = [];
  const fetcher = async (url, options = {}) => {
    if (options.method === 'POST') {
      posts.push({ url, body: JSON.parse(options.body) });
      return { ok: indexNowStatus === 200, status: indexNowStatus, text: async () => '' };
    }
    const { pathname } = new URL(url);
    const body =
      pathname === '/sitemap.xml' ? sitemapXml(entries) : (FILE_BODIES[pathname] ?? pageHtml(url));
    return { ok: true, status: 200, text: async () => body, json: async () => ({ items: [] }) };
  };
  return { fetcher, posts };
}

const watch = (web, overrides = {}) =>
  runWatch({
    apply: true,
    fetcher: web.fetcher,
    readLog: () => '',
    env: {},
    submitted: {},
    key: KEY,
    now: NOW,
    retryDelayMs: 0,
    ...overrides,
  });

test('사이트맵에서 URL과 수정 시각을 읽는다', () => {
  const entries = parseSitemap(
    sitemapXml([
      ['/blog/a?x=1&amp;y=2', '2026-10-01'],
      ['/feed', ''],
    ])
  );

  assert.deepEqual(entries, [
    { loc: `${SITE}/blog/a?x=1&y=2`, lastmod: '2026-10-01' },
    { loc: `${SITE}/feed`, lastmod: '' },
  ]);
});

test('지난번에 알린 뒤 바뀐 URL과 그 목록 화면만 색인 요청 대상으로 고른다', () => {
  const entries = parseSitemap(
    sitemapXml([
      ['', ''],
      ['/blog', ''],
      ['/feed', ''],
      ['/blog/dev/a', '2026-10-05'],
      ['/feed/1', '2026-09-01'],
    ])
  );
  const submitted = { ...toSubmittedState(entries), [`${SITE}/blog/dev/a`]: '2026-10-01' };

  const plan = planIndexNow(entries, submitted);

  assert.deepEqual(
    plan.changed.map(entry => entry.loc),
    [`${SITE}/blog/dev/a`]
  );
  assert.deepEqual(plan.urls, [`${SITE}/blog/dev/a`, SITE, `${SITE}/blog`]);
});

test('바뀐 URL이 없으면 아무것도 요청하지 않는다', () => {
  const entries = parseSitemap(sitemapXml([['/blog/dev/a', '2026-10-05']]));

  assert.deepEqual(planIndexNow(entries, toSubmittedState(entries)).urls, []);
});

test('색인 대상 화면에서 빠진 머리말 정보를 찾아낸다', () => {
  const url = `${SITE}/blog/dev/a`;
  const broken = '<html><head><meta name="robots" content="noindex"/></head><body></body></html>';

  assert.deepEqual(findPageProblems({ url, status: 200, html: pageHtml(url) }), []);
  assert.deepEqual(findPageProblems({ url, status: 503, html: '' }), ['HTTP 503']);
  assert.deepEqual(findPageProblems({ url, status: 200, html: broken }), [
    'title 없음',
    'description 없음',
    'canonical 없음',
    'noindex인데 색인 대상에 포함됨',
    'h1 0개',
    '구조화 데이터 없음',
  ]);
});

test('ads.txt에 게시자 줄이 없으면 문제로 본다', () => {
  assert.deepEqual(
    findFileProblems({ name: 'ads.txt', status: 200, body: FILE_BODIES['/ads.txt'] }),
    []
  );
  assert.deepEqual(findFileProblems({ name: 'ads.txt', status: 200, body: '<html>' }), [
    '게시자 줄 없음',
  ]);
  assert.deepEqual(findFileProblems({ name: 'ads.txt', status: 404, body: '' }), ['HTTP 404']);
});

test('접근 로그에서 크롤러 방문만 종류별로 센다', () => {
  const line = (at, uri, status, crawler, host = 'kscold.com') =>
    `${at} request_id=x host=${host} method=GET uri=${uri} status=${status} bytes=1 request_time=0.1 upstream_time=0.1 crawler=${crawler}`;
  const log = [
    line('2026-10-05T20:00:00+00:00', '/ads.txt', 200, 'google-adsense'),
    line('2026-10-05T21:00:00+00:00', '/blog/dev/a', 200, 'googlebot'),
    line('2026-10-05T22:00:00+00:00', '/blog/gone', 404, 'googlebot'),
    line('2026-10-05T23:00:00+00:00', '/blog', 200, '-'),
    line('2026-10-05T23:30:00+00:00', '/', 200, 'googlebot', 'slacord.cloud'),
    line('2026-10-01T00:00:00+00:00', '/', 200, 'naver'),
  ].join('\n');

  const summary = summarizeCrawlers(log, { hosts: ['kscold.com'], since: NOW - 86_400_000 });

  assert.deepEqual(summary, [
    {
      crawler: 'googlebot',
      hits: 2,
      pages: 2,
      errors: 1,
      lastSeenAt: '2026-10-05T22:00:00+00:00',
      watched: {},
    },
    {
      crawler: 'google-adsense',
      hits: 1,
      pages: 1,
      errors: 0,
      lastSeenAt: '2026-10-05T20:00:00+00:00',
      watched: { '/ads.txt': 200 },
    },
  ]);
});

test('검색 결과에서 내 사이트의 순위를 찾고 키가 없으면 조회하지 않는다', async () => {
  const links = ['https://example.com/a', 'https://blog.kscold.com/x', 'https://notkscold.com/'];
  assert.equal(findPosition(links, 'kscold.com'), 2);
  assert.equal(findPosition(['https://notkscold.com/'], 'kscold.com'), null);

  const ranks = await checkRanks({
    queries: ['김승찬 블로그'],
    host: 'kscold.com',
    env: {},
    fetcher: () => assert.fail(),
  });
  assert.deepEqual(ranks, []);
});

test('검색엔진이 받아들이면 알린 상태를 갱신하고 다음 실행에서는 다시 보내지 않는다', async () => {
  const entries = [
    ['', ''],
    ['/blog', ''],
    ['/blog/dev/a', '2026-10-05'],
  ];
  const web = fakeWeb(entries);

  const first = await watch(web);
  const second = await watch(web, { submitted: first.nextSubmitted });

  assert.equal(first.indexNow.accepted, true);
  assert.deepEqual(web.posts[0].body, {
    host: 'kscold.com',
    key: KEY,
    keyLocation: `${SITE}/${KEY}.txt`,
    urlList: [SITE, `${SITE}/blog`, `${SITE}/blog/dev/a`],
  });
  assert.equal(second.indexNow.urls.length, 0);
  assert.equal(web.posts.length, 2);
});

test('검색엔진이 거절하면 알린 상태를 그대로 두어 다음 실행에서 다시 보낸다', async () => {
  const web = fakeWeb([['/blog/dev/a', '2026-10-05']], { indexNowStatus: 403 });

  const result = await watch(web);

  assert.equal(result.indexNow.accepted, false);
  assert.deepEqual(result.nextSubmitted, {});
  assert.match(renderReport(result), /api\.indexnow\.org: HTTP 403/);
});

test('미리보기 실행은 색인 요청을 보내지 않는다', async () => {
  const web = fakeWeb([['/blog/dev/a', '2026-10-05']]);

  const result = await watch(web, { apply: false });

  assert.equal(web.posts.length, 0);
  assert.equal(result.indexNow.dryRun, true);
  assert.match(renderReport(result), /미리보기 실행이라 요청하지 않음/);
});

test('키를 처음 쓸 때 온 403은 잠깐 뒤 한 번 더 보내 복구한다', async () => {
  const statuses = [403, 200, 403, 403];
  const fetcher = async () => ({ status: statuses.shift() });

  const outcome = await submitIndexNow({
    urls: [`${SITE}/`],
    site: SITE,
    key: KEY,
    fetcher,
    retryDelayMs: 0,
  });

  assert.equal(outcome.accepted, true);
  assert.deepEqual(
    outcome.responses.map(response => response.outcome),
    ['HTTP 200', 'HTTP 403']
  );
});

test('색인 요청은 받아들인 곳이 하나라도 있으면 성공으로 본다', async () => {
  const statuses = [500, 202];
  const fetcher = async () => ({ status: statuses.shift() });

  const outcome = await submitIndexNow({ urls: [`${SITE}/`], site: SITE, key: KEY, fetcher });

  assert.equal(outcome.accepted, true);
  assert.deepEqual(
    outcome.responses.map(response => response.outcome),
    ['HTTP 500', 'HTTP 202']
  );
});
