import { expect, test } from '@playwright/test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadSearchQueries, type GscRow } from '../src/widgets/admin/search-insights/server/searchQueries';
import { SearchInsightsDashboard } from '../src/widgets/admin/search-insights/ui/SearchInsightsDashboard';
import type { SearchInsights } from '../src/widgets/admin/search-insights/model/types';

const range = { startDate: '2026-10-07', endDate: '2026-11-03' };
const row = (key: string, impressions: number, clicks = 0): GscRow => ({
  keys: [key], impressions, clicks, ctr: 0, position: 3,
});

test('최근 검색어가 있으면 기존 기간을 유지하고 노출 순으로 보여 준다', async () => {
  let calls = 0;
  const result = await loadSearchQueries(async () => {
    calls += 1;
    return { rows: [row('적게 노출된 검색어', 2, 1), row('많이 노출된 검색어', 8)] };
  }, range);
  expect(calls).toBe(1);
  expect(result.startDate).toBe(range.startDate);
  expect(result.rows.map(item => item.keys[0])).toEqual(['많이 노출된 검색어', '적게 노출된 검색어']);
});

test('최근 검색어가 없으면 180일로 넓히고 실제 조회 기간을 함께 반환한다', async () => {
  const calls: object[] = [];
  const result = await loadSearchQueries(async body => {
    calls.push(body);
    return calls.length === 1 ? {} : { rows: [row('이전 검색어', 4)] };
  }, range);
  expect(calls).toHaveLength(2);
  expect(calls[1]).toMatchObject({ dimensions: ['query'], startDate: '2026-05-08' });
  expect(result).toMatchObject({ startDate: '2026-05-08', endDate: '2026-11-03' });
  expect(result.rows[0].keys[0]).toBe('이전 검색어');
});

test('조회 실패를 빈 검색어 결과로 숨기지 않는다', async () => {
  await expect(loadSearchQueries(async () => { throw new Error('조회 실패'); }, range))
    .rejects.toThrow('조회 실패');
});

test('관리자 화면에 확장된 검색어 기간과 이유를 함께 표시한다', async ({ page }) => {
  const insights: SearchInsights = {
    generatedAt: '2026-11-06T00:00:00Z', coverage: null,
    searchConsole: { ok: true, data: {
      ...range, clicks: 2, impressions: 46, ctr: 4, position: 5, daily: [], pages: [], sitemap: null,
      queries: { ok: true, data: {
        startDate: '2026-05-08', endDate: range.endDate,
        rows: [{ key: '이전 검색어', clicks: 0, impressions: 4, position: 3 }],
      } },
    } },
    analytics: { ok: false, error: '테스트' },
  };
  await page.setContent(renderToStaticMarkup(createElement(SearchInsightsDashboard, { insights })));
  const card = page.locator('section').filter({ has: page.getByRole('heading', { name: '많이 노출된 검색어' }) });
  await expect(card).toContainText('2026-05-08 ~ 2026-11-03');
  await expect(card).toContainText('최근 28일에 공개된 검색어가 없어 최근 180일');
  await expect(card).toContainText('이전 검색어');
});
