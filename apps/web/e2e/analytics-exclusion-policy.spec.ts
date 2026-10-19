import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';
import ts from 'typescript';
import { isStandalonePage, isUntrackedPage } from '../src/shared/config/standalonePages';

declare global {
  interface Window {
    analyticsPolicy: typeof import('../src/shared/lib/analytics');
    pendingAnalyticsIdle: IdleRequestCallback[];
    cancelledAnalyticsIdle: number[];
  }
}

// 실제 배포 모듈을 브라우저에서 실행하되 GA 통신은 가로채 외부로 보내지 않는다.
const source = readFileSync(resolve(__dirname, '../src/shared/lib/analytics.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
}).outputText;

test.beforeEach(async ({ page }) => {
  await page.route('https://www.googletagmanager.com/**', route =>
    route.fulfill({ contentType: 'application/javascript', body: '' })
  );
  await page.route('https://analytics.test/**', route =>
    route.fulfill({ contentType: 'text/html; charset=utf-8', body: '<!doctype html><title>검증</title>' })
  );
  await page.goto('https://analytics.test/blog');
  await page.addScriptTag({ content: `(() => { const exports = {}; ${compiled}\nwindow.analyticsPolicy = exports; })();` });
  await page.evaluate(() => {
    window.pendingAnalyticsIdle = [];
    window.cancelledAnalyticsIdle = [];
    window.requestIdleCallback = callback => window.pendingAnalyticsIdle.push(callback);
    window.cancelIdleCallback = id => window.cancelledAnalyticsIdle.push(id);
  });
});

test('공유 페이지와 강의·슬라이드는 모두 공통 추적 제외 대상으로 판별한다', () => {
  expect(isUntrackedPage({}, '/hansalim')).toBe(true);
  expect(isUntrackedPage({}, '/hansalim/slides/')).toBe(true);
  expect(isUntrackedPage({ applicationPage: 'private-example' }, '/private-example')).toBe(true);
  expect(isUntrackedPage({}, '/blog')).toBe(false);
});

test('강의 자료 페이지는 블로그 틀 안에 두고 슬라이드와 공유 페이지만 단독으로 연다', () => {
  expect(isStandalonePage({}, '/hansalim')).toBe(false);
  expect(isStandalonePage({}, '/hansalim/slides/')).toBe(true);
  expect(isStandalonePage({ applicationPage: 'private-example' }, '/private-example')).toBe(true);
  expect(isStandalonePage({}, '/blog')).toBe(false);
});

test('추적 제외 상태에서 늦은 초기화가 호출돼도 제외를 해제하거나 요청하지 않는다', async ({ page }) => {
  const state = await page.evaluate(() => {
    Object.assign(window, { 'ga-disable-G-AUDIT': true });
    window.analyticsPolicy.scheduleAnalyticsLoad('G-AUDIT', () => {
      window.analyticsPolicy.trackAnalyticsPage('G-AUDIT', '/hansalim', '');
    });
    window.pendingAnalyticsIdle[0]({ didTimeout: false, timeRemaining: () => 50 });
    return { disabled: Reflect.get(window, 'ga-disable-G-AUDIT'), queue: window.dataLayer };
  });
  expect(state).toEqual({ disabled: true, queue: undefined });
  await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(0);
});

test('공개 페이지를 떠나면 예약을 취소하고 이미 꺼낸 콜백도 무시한다', async ({ page }) => {
  const state = await page.evaluate(() => {
    const cancel = window.analyticsPolicy.scheduleAnalyticsLoad('G-AUDIT', () => {
      window.analyticsPolicy.trackAnalyticsPage('G-AUDIT', '/blog', '');
    });
    cancel();
    Object.assign(window, { 'ga-disable-G-AUDIT': true });
    window.pendingAnalyticsIdle[0]({ didTimeout: false, timeRemaining: () => 50 });
    return { cancelled: window.cancelledAnalyticsIdle, queue: window.dataLayer };
  });
  expect(state).toEqual({ cancelled: [1], queue: undefined });
  await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(0);
});

test('문서 로딩 중 떠나면 load 이벤트에 연결했던 예약도 취소한다', async ({ page }) => {
  const idleCount = await page.evaluate(() => {
    Object.defineProperty(document, 'readyState', { configurable: true, value: 'loading' });
    const cancel = window.analyticsPolicy.scheduleAnalyticsLoad('G-AUDIT', () => {});
    cancel();
    window.dispatchEvent(new Event('load'));
    return window.pendingAnalyticsIdle.length;
  });
  expect(idleCount).toBe(0);
});

test('idle API가 없는 브라우저에서도 이동하면 타이머를 취소한다', async ({ page }) => {
  await page.evaluate(() => {
    Object.defineProperty(window, 'requestIdleCallback', { value: undefined });
    const cancel = window.analyticsPolicy.scheduleAnalyticsLoad('G-AUDIT', () => {});
    cancel();
  });
  // 별도 이벤트 루프가 돌아간 뒤에도 스크립트와 초기화 큐가 없어야 한다.
  await page.evaluate(() => new Promise(resolve => window.setTimeout(resolve, 20)));
  await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(0);
  expect(await page.evaluate(() => window.dataLayer)).toBeUndefined();
});

test('허용 경로에서만 페이지뷰를 보내고 연속한 인증 쿼리도 모두 제거한다', async ({ page }) => {
  const commands = await page.evaluate(() => {
    const track = () => window.analyticsPolicy.trackAnalyticsPage(
      'G-AUDIT', '/blog', 'code=secret&token=secret&access_token=secret&page=2'
    );
    window.analyticsPolicy.scheduleAnalyticsLoad('G-AUDIT', track);
    window.pendingAnalyticsIdle[0]({ didTimeout: false, timeRemaining: () => 50 });
    Object.assign(window, { 'ga-disable-G-AUDIT': true });
    window.analyticsPolicy.trackAnalyticsPage('G-AUDIT', '/hansalim', '');
    Object.assign(window, { 'ga-disable-G-AUDIT': false });
    window.analyticsPolicy.scheduleAnalyticsLoad('G-AUDIT', track);
    window.pendingAnalyticsIdle[1]({ didTimeout: false, timeRemaining: () => 50 });
    return window.dataLayer?.map(command => Array.from(command as IArguments));
  });
  expect(commands).toHaveLength(4);
  expect(commands?.[1]).toEqual(['config', 'G-AUDIT', { send_page_view: false }]);
  expect(commands?.[2]).toEqual(['config', 'G-AUDIT', {
    page_path: '/blog?page=2', page_location: 'https://analytics.test/blog?page=2', page_title: '검증',
  }]);
  expect(commands?.[3]).toEqual(commands?.[2]);
  await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(1);
});
