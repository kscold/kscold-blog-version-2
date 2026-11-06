const DAY_MS = 86_400_000;
const FALLBACK_DAYS = 180;
const QUERY_ROW_LIMIT = 1000;
const DISPLAY_ROWS = 10;

export interface GscRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

type SearchQuery = (body: object) => Promise<{ rows?: GscRow[] }>;
type DateRange = { startDate: string; endDate: string };

/** 최근 검색어가 공개되지 않으면 기간을 넓혀 구글이 제공하는 결과를 찾는다. */
export async function loadSearchQueries(query: SearchQuery, range: DateRange) {
  const options = { dimensions: ['query'], rowLimit: QUERY_ROW_LIMIT };
  let startDate = range.startDate;
  let rows = (await query(options)).rows ?? [];

  if (rows.length === 0) {
    startDate = new Date(Date.parse(range.endDate) - (FALLBACK_DAYS - 1) * DAY_MS)
      .toISOString()
      .slice(0, 10);
    rows = (await query({ ...options, startDate })).rows ?? [];
  }

  return {
    startDate,
    endDate: range.endDate,
    rows: [...rows]
      .sort((left, right) => right.impressions - left.impressions || right.clicks - left.clicks)
      .slice(0, DISPLAY_ROWS),
  };
}
