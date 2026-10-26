import type { SearchInsights } from '../model/types';
import { Card, DailyBars, RankedList, SectionError, Stat } from './InsightParts';

const SITE_ORIGIN = 'https://kscold.com';

function toPath(url: string) {
  const path = url.startsWith(SITE_ORIGIN) ? url.slice(SITE_ORIGIN.length) || '/' : url;
  try {
    return decodeURI(path);
  } catch {
    return path;
  }
}

function formatTime(value: string | null | undefined) {
  return value ? new Date(value).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }) : '없음';
}

/** 구글 서치 콘솔·GA4·색인 현황을 한 화면에 모은다. 서버에서 그린다. */
export function SearchInsightsDashboard({ insights }: { insights: SearchInsights }) {
  const { searchConsole, analytics, coverage } = insights;

  return (
    <div className="space-y-6" data-testid="search-insights">
      <p className="text-xs text-surface-400">
        {formatTime(insights.generatedAt)}에 불러옴 · 30분 동안 같은 결과를 보여 줍니다
      </p>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="색인된 페이지"
          value={coverage ? `${coverage.indexed} / ${coverage.total}` : '—'}
          hint={coverage ? `${formatTime(coverage.checkedAt)} 기준` : 'seo-watch 기록 없음'}
        />
        <Stat
          label="검색 클릭 (28일)"
          value={searchConsole.ok ? searchConsole.data.clicks.toLocaleString() : '—'}
          hint={
            searchConsole.ok ? `노출 ${searchConsole.data.impressions.toLocaleString()}` : undefined
          }
        />
        <Stat
          label="평균 순위 · 클릭률"
          value={searchConsole.ok ? `${searchConsole.data.position}위` : '—'}
          hint={searchConsole.ok ? `클릭률 ${searchConsole.data.ctr}%` : undefined}
        />
        <Stat
          label="검색 유입 세션 (28일)"
          value={analytics.ok ? analytics.data.organicSessions.toLocaleString() : '—'}
          hint={
            analytics.ok
              ? `방문자 ${analytics.data.organicUsers.toLocaleString()} · 전체 세션 ${analytics.data.totalSessions.toLocaleString()}`
              : undefined
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          title="구글 검색 노출 (서치 콘솔)"
          note={
            searchConsole.ok
              ? `${searchConsole.data.startDate} ~ ${searchConsole.data.endDate}`
              : undefined
          }
        >
          {searchConsole.ok ? (
            <DailyBars
              points={searchConsole.data.daily.map(day => ({
                date: day.date,
                value: day.impressions,
              }))}
            />
          ) : (
            <SectionError message={searchConsole.error} />
          )}
        </Card>
        <Card
          title="검색 유입 세션 (GA4)"
          note={
            analytics.ok ? `${analytics.data.startDate} ~ ${analytics.data.endDate}` : undefined
          }
        >
          {analytics.ok ? (
            <DailyBars points={analytics.data.dailyOrganic} />
          ) : (
            <SectionError message={analytics.error} />
          )}
        </Card>
      </div>

      {searchConsole.ok && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="많이 노출된 페이지" note="노출 · 클릭 · 평균 순위">
            <RankedList
              rows={searchConsole.data.pages.map(row => ({
                label: toPath(row.key),
                value: row.impressions,
                detail: `${row.impressions} · ${row.clicks} · ${row.position}위`,
              }))}
            />
          </Card>
          <Card title="많이 노출된 검색어" note="노출 · 클릭 · 평균 순위">
            <RankedList
              empty="검색량이 적으면 구글이 검색어를 숨깁니다"
              rows={searchConsole.data.queries.map(row => ({
                label: row.key,
                value: row.impressions,
                detail: `${row.impressions} · ${row.clicks} · ${row.position}위`,
              }))}
            />
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="색인 상태" note="seo-watch가 매일 URL 검사로 갱신">
          {coverage ? (
            <RankedList
              rows={Object.entries(coverage.byCoverage)
                .sort(([, left], [, right]) => right - left)
                .map(([label, count]) => ({ label, value: count }))}
            />
          ) : (
            <p className="py-6 text-center text-sm text-surface-400">아직 기록이 없습니다</p>
          )}
          {searchConsole.ok && searchConsole.data.sitemap && (
            <p className="mt-4 text-xs text-surface-500">
              사이트맵: 구글이 아는 URL {searchConsole.data.sitemap.submitted}개 · 마지막으로 읽은
              시각 {formatTime(searchConsole.data.sitemap.lastDownloaded)}
            </p>
          )}
        </Card>
        {analytics.ok && (
          <Card title="유입 경로 · 검색 유입 첫 페이지" note="세션">
            <RankedList
              rows={analytics.data.channels.map(row => ({
                label: row.channel,
                value: row.sessions,
              }))}
            />
            <div className="mt-5 border-t border-surface-100 pt-4">
              <RankedList
                empty="검색으로 들어온 세션이 없습니다"
                rows={analytics.data.landingPages.map(row => ({
                  label: toPath(row.path),
                  value: row.sessions,
                }))}
              />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
