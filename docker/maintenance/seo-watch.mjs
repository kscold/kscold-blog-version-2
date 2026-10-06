import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { summarizeCrawlers } from './seo-watch/crawlers.mjs';
import { findFileProblems, findPageProblems } from './seo-watch/health.mjs';
import { findIndexNowKey, submitIndexNow } from './seo-watch/indexnow.mjs';
import { checkRanks } from './seo-watch/rank.mjs';
import { renderReport, toHistoryRecord } from './seo-watch/report.mjs';
import { parseSitemap, planIndexNow, toSubmittedState } from './seo-watch/sitemap.mjs';

const SITE = 'https://kscold.com';
const HOSTS = ['kscold.com', 'www.kscold.com'];
const PAGES = ['/', '/blog', '/feed', '/info', '/notes'];
const FILES = ['robots.txt', 'sitemap.xml', 'rss.xml', 'ads.txt', 'llms.txt'];
const RANK_QUERIES = ['김승찬 블로그', '김승찬 개발자', '김승찬', 'kscold'];
const RECENT_SAMPLE_SIZE = 8;
const DAY_MS = 86_400_000;
const LOG_TAIL_LINES = '60000';
const USER_AGENT = 'kscold-seo-watch/1.0 (+https://kscold.com)';

const REPOSITORY_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const STATE_DIRECTORY = join(homedir(), '.local/state/kscold-seo-watch');

async function fetchText(fetcher, url) {
  try {
    const response = await fetcher(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(20_000),
    });
    return { status: response.status, body: await response.text() };
  } catch {
    return { status: 0, body: '' };
  }
}

/** 고정 화면과 최근에 고친 글 몇 편, 검색엔진이 읽는 파일들이 정상인지 확인한다. */
async function checkHealth({ fetcher, entries, key }) {
  const recent = [...entries]
    .filter(entry => entry.lastmod && !PAGES.includes(new URL(entry.loc).pathname))
    .sort((left, right) => right.lastmod.localeCompare(left.lastmod))
    .slice(0, RECENT_SAMPLE_SIZE)
    .map(entry => entry.loc);
  const health = [];
  for (const url of [...PAGES.map(path => `${SITE}${path}`), ...recent]) {
    const { status, body } = await fetchText(fetcher, url);
    const target = decodeURI(new URL(url).pathname);
    health.push({ target, problems: findPageProblems({ url, status, html: body }) });
  }
  for (const name of FILES) {
    const { status, body } = await fetchText(fetcher, `${SITE}/${name}`);
    health.push({ target: `/${name}`, problems: findFileProblems({ name, status, body }) });
  }
  if (key) {
    const { status, body } = await fetchText(fetcher, `${SITE}/${key}.txt`);
    const problems =
      status === 200 && body.trim() === key ? [] : ['IndexNow 키 파일이 배포되지 않음'];
    health.push({ target: '/<IndexNow 키>.txt', problems });
  }
  return health;
}

async function requestIndexing({ plan, key, apply, fetcher, retryDelayMs }) {
  const summary = { changed: plan.changed.length, urls: plan.urls, dryRun: !apply, responses: [] };
  if (!apply || plan.urls.length === 0) return { ...summary, accepted: false };
  if (!key) {
    return { ...summary, accepted: false, responses: [{ endpoint: '-', outcome: '키 파일 없음' }] };
  }
  const outcome = await submitIndexNow({ urls: plan.urls, site: SITE, key, fetcher, retryDelayMs });
  return { ...summary, ...outcome };
}

/** 하루 한 번 도는 점검의 본체. 외부와 닿는 부분은 모두 주입받아 테스트에서 바꿔 끼운다. */
export async function runWatch({
  apply,
  fetcher,
  readLog,
  env,
  submitted,
  key,
  now = Date.now(),
  retryDelayMs,
}) {
  const sitemap = await fetchText(fetcher, `${SITE}/sitemap.xml`);
  const entries = parseSitemap(sitemap.body);
  const indexNow = await requestIndexing({
    plan: planIndexNow(entries, submitted),
    key,
    apply,
    fetcher,
    retryDelayMs,
  });
  const logText = readLog();
  return {
    at: new Date(now).toISOString(),
    date: new Date(now + 9 * 3_600_000).toISOString().slice(0, 10),
    site: SITE,
    sitemapCount: entries.length,
    health: await checkHealth({ fetcher, entries, key }),
    indexNow,
    crawlers:
      logText === null ? null : summarizeCrawlers(logText, { hosts: HOSTS, since: now - DAY_MS }),
    ranks: await checkRanks({ queries: RANK_QUERIES, host: HOSTS[0], env, fetcher }),
    nextSubmitted: indexNow.accepted ? toSubmittedState(entries) : submitted,
  };
}

function readNginxLog(binary = '/usr/local/bin/docker') {
  try {
    return execFileSync(
      binary,
      ['--context', 'colima', 'logs', '--tail', LOG_TAIL_LINES, 'kscold-nginx'],
      {
        encoding: 'utf8',
        timeout: 60_000,
        maxBuffer: 256 * 1024 * 1024,
        stdio: ['ignore', 'pipe', 'ignore'],
      }
    );
  } catch {
    return null;
  }
}

/** 검색 API 키처럼 저장소에 두면 안 되는 값은 홈 디렉터리의 env 파일에서 읽는다. */
function readEnvFile(path) {
  if (!existsSync(path)) return {};
  const pairs = readFileSync(path, 'utf8')
    .split('\n')
    .map(line => /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line))
    .filter(Boolean)
    .map(([, name, value]) => [name, value.replace(/^['"]|['"]$/g, '')]);
  return Object.fromEntries(pairs);
}

function readJson(path, fallback) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return fallback;
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.some(arg => arg !== '--apply')) {
    throw new Error('사용법: node docker/maintenance/seo-watch.mjs [--apply]');
  }
  const apply = args.includes('--apply');
  const env = { ...readEnvFile(join(homedir(), '.config/kscold-seo-watch/env')), ...process.env };
  const statePath = join(STATE_DIRECTORY, 'state.json');
  const result = await runWatch({
    apply,
    fetcher: fetch,
    readLog: () => readNginxLog(env.DOCKER_BIN),
    env,
    submitted: readJson(statePath, {}).submitted ?? {},
    key: findIndexNowKey(join(REPOSITORY_ROOT, 'apps/web/public')),
  });

  const report = renderReport(result);
  if (apply) {
    const reportDirectory = env.SEO_WATCH_REPORT_DIR || join(STATE_DIRECTORY, 'reports');
    mkdirSync(reportDirectory, { recursive: true });
    mkdirSync(STATE_DIRECTORY, { recursive: true, mode: 0o700 });
    writeFileSync(join(reportDirectory, `${result.date}.md`), report);
    writeFileSync(statePath, JSON.stringify({ submitted: result.nextSubmitted }, null, 1));
    appendFileSync(
      join(STATE_DIRECTORY, 'history.jsonl'),
      `${JSON.stringify(toHistoryRecord(result))}\n`
    );
  }
  console.log(report);
  if (result.health.some(item => item.problems.length > 0)) process.exitCode = 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(`검색 노출 점검 실패 (${error.name}: ${error.message})`);
    process.exitCode = 1;
  });
}
