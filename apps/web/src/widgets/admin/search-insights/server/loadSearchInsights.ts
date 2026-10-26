import { unstable_cache } from 'next/cache';
import type {
  AnalyticsInsights,
  IndexCoverage,
  RankedRow,
  SearchConsoleInsights,
  SearchInsights,
  Section,
} from '../model/types';
import {
  createGoogleClient,
  readJsonFile,
  SEARCH_INSIGHTS_STATE_DIR,
  type GoogleClient,
} from './googleApi';

const SITE = 'https://kscold.com/';
const GSC = 'https://searchconsole.googleapis.com/webmasters/v3';
const GA4 = 'https://analyticsdata.googleapis.com/v1beta';
const DAYS = 28;
// 서치 콘솔 실적은 2~3일 늦게 채워진다.
const GSC_LAG_DAYS = 3;
const TOP_ROWS = 10;
const DAY_MS = 86_400_000;

interface GscRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface Ga4Report {
  rows?: { dimensionValues?: { value: string }[]; metricValues: { value: string }[] }[];
}

const isoDay = (offsetDays: number) =>
  new Date(Date.now() - offsetDays * DAY_MS).toISOString().slice(0, 10);

const round = (value: number, digits = 1) => Math.round(value * 10 ** digits) / 10 ** digits;

async function section<T>(load: () => Promise<T>): Promise<Section<T>> {
  try {
    return { ok: true, data: await load() };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : '알 수 없는 오류' };
  }
}

async function loadSearchConsole(client: GoogleClient): Promise<SearchConsoleInsights> {
  const site = encodeURIComponent(SITE);
  const range = { startDate: isoDay(GSC_LAG_DAYS + DAYS - 1), endDate: isoDay(GSC_LAG_DAYS) };
  const query = (body: object) =>
    client.post<{ rows?: GscRow[] }>(`${GSC}/sites/${site}/searchAnalytics/query`, {
      ...range,
      ...body,
    });
  const toRanked = (row: GscRow): RankedRow => ({
    key: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions,
    position: round(row.position),
  });

  const [total, daily, pages, queries, sitemap] = await Promise.all([
    query({}),
    query({ dimensions: ['date'] }),
    query({ dimensions: ['page'], rowLimit: TOP_ROWS }),
    query({ dimensions: ['query'], rowLimit: TOP_ROWS }),
    client
      .get<{
        lastDownloaded?: string;
        contents?: { type: string; submitted: string }[];
      }>(`${GSC}/sites/${site}/sitemaps/${encodeURIComponent(`${SITE}sitemap.xml`)}`)
      .catch(() => null),
  ]);
  const totals = total.rows?.[0];
  return {
    ...range,
    clicks: totals?.clicks ?? 0,
    impressions: totals?.impressions ?? 0,
    ctr: round((totals?.ctr ?? 0) * 100),
    position: round(totals?.position ?? 0),
    daily: (daily.rows ?? []).map(row => ({
      date: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
    })),
    pages: (pages.rows ?? []).map(toRanked),
    queries: (queries.rows ?? []).map(toRanked),
    sitemap: sitemap
      ? {
          submitted: Number(sitemap.contents?.find(item => item.type === 'web')?.submitted ?? 0),
          lastDownloaded: sitemap.lastDownloaded ?? null,
        }
      : null,
  };
}

const ORGANIC_FILTER = {
  filter: {
    fieldName: 'sessionDefaultChannelGroup',
    stringFilter: { value: 'Organic Search' },
  },
};

async function loadAnalytics(client: GoogleClient, propertyId: string): Promise<AnalyticsInsights> {
  const range = { startDate: isoDay(DAYS), endDate: isoDay(1) };
  const report = (body: object) =>
    client.post<Ga4Report>(`${GA4}/properties/${propertyId}:runReport`, {
      dateRanges: [range],
      ...body,
    });
  const metric = (row: NonNullable<Ga4Report['rows']>[number], index = 0) =>
    Number(row.metricValues[index]?.value ?? 0);
  const dimension = (row: NonNullable<Ga4Report['rows']>[number]) =>
    row.dimensionValues?.[0]?.value ?? '';

  const [organic, daily, channels, landing] = await Promise.all([
    report({
      metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
      dimensionFilter: ORGANIC_FILTER,
    }),
    report({
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'sessions' }],
      dimensionFilter: ORGANIC_FILTER,
      orderBys: [{ dimension: { dimensionName: 'date' } }],
    }),
    report({
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [{ name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    }),
    report({
      dimensions: [{ name: 'landingPage' }],
      metrics: [{ name: 'sessions' }],
      dimensionFilter: ORGANIC_FILTER,
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: TOP_ROWS,
    }),
  ]);
  const channelRows = (channels.rows ?? []).map(row => ({
    channel: dimension(row),
    sessions: metric(row),
  }));
  const organicRow = organic.rows?.[0];
  return {
    ...range,
    organicSessions: organicRow ? metric(organicRow) : 0,
    organicUsers: organicRow ? metric(organicRow, 1) : 0,
    totalSessions: channelRows.reduce((sum, row) => sum + row.sessions, 0),
    dailyOrganic: (daily.rows ?? []).map(row => {
      const value = dimension(row);
      return {
        date: `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`,
        value: metric(row),
      };
    }),
    channels: channelRows,
    landingPages: (landing.rows ?? []).map(row => ({
      path: dimension(row),
      sessions: metric(row),
    })),
  };
}

async function loadUncached(): Promise<SearchInsights> {
  const coverage = await readJsonFile<IndexCoverage>(
    'index-coverage.json',
    SEARCH_INSIGHTS_STATE_DIR
  );
  const settings = await readJsonFile<{ ga4PropertyId: string }>('settings.json');
  let client: GoogleClient | null = null;
  let clientError = '서비스 계정 키가 배포되지 않았습니다';
  try {
    client = await createGoogleClient();
  } catch (error) {
    clientError = error instanceof Error ? error.message : clientError;
  }
  const unavailable = { ok: false as const, error: clientError };
  return {
    generatedAt: new Date().toISOString(),
    searchConsole: client ? await section(() => loadSearchConsole(client)) : unavailable,
    analytics:
      client && settings?.ga4PropertyId
        ? await section(() => loadAnalytics(client, settings.ga4PropertyId))
        : client
          ? { ok: false, error: 'GA4 속성 번호(settings.json)가 없습니다' }
          : unavailable,
    coverage,
  };
}

/** 구글 API 호출을 아끼려고 30분 동안 같은 결과를 쓴다. 관리자 확인 뒤에만 부른다. */
export const loadSearchInsights = unstable_cache(loadUncached, ['admin-search-insights'], {
  revalidate: 1800,
});
