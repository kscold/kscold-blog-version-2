/** 날짜별 값. 막대 그래프 한 칸이다. */
export interface DailyPoint {
  date: string;
  value: number;
}

export interface RankedRow {
  key: string;
  clicks: number;
  impressions: number;
  position: number;
}

export interface LandingRow {
  path: string;
  sessions: number;
}

export interface ChannelRow {
  channel: string;
  sessions: number;
}

/** 실패한 영역만 비우고 나머지는 보여 주도록, 영역마다 오류를 따로 담는다. */
export type Section<T> = { ok: true; data: T } | { ok: false; error: string };

export interface SearchConsoleInsights {
  startDate: string;
  endDate: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  daily: { date: string; clicks: number; impressions: number }[];
  pages: RankedRow[];
  queries: RankedRow[];
  sitemap: { submitted: number; lastDownloaded: string | null } | null;
}

export interface AnalyticsInsights {
  startDate: string;
  endDate: string;
  organicSessions: number;
  organicUsers: number;
  totalSessions: number;
  dailyOrganic: DailyPoint[];
  channels: ChannelRow[];
  landingPages: LandingRow[];
}

/** seo-watch가 매일 URL 검사 API로 모은 색인 현황. */
export interface IndexCoverage {
  checkedAt: string;
  total: number;
  indexed: number;
  unchecked: number;
  byCoverage: Record<string, number>;
}

export interface SearchInsights {
  generatedAt: string;
  searchConsole: Section<SearchConsoleInsights>;
  analytics: Section<AnalyticsInsights>;
  coverage: IndexCoverage | null;
}
