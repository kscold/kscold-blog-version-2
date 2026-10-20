import { expect, test, type Page } from '@playwright/test';
import { createAdminAccessToken, createVerifiedAdminAccessToken } from './support/auth';

// 시험용 가짜 대본(e2e/fixtures/hansalim-presenter)을 읽는다. 실제 대본은 공개 저장소에 없다.
const PRESENTER = '/hansalim/presenter';
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3101';

async function setAuthCookie(page: Page, token: string) {
  await page
    .context()
    .addCookies([
      { name: 'auth-token', value: token, domain: new URL(baseURL).hostname, path: '/' },
    ]);
}

test.describe('한살림 강사 발표 화면', () => {
  test('로그인하지 않으면 로그인 화면으로 보내고 강사용 PDF도 내주지 않는다', async ({
    page,
    request,
  }) => {
    await page.goto(PRESENTER);
    await expect(page).toHaveURL(/\/login\?redirect=%2Fhansalim%2Fpresenter/);
    const deck = await request.get(`${PRESENTER}/deck`);
    expect(deck.status()).toBe(401);
  });

  test('모양만 관리자인 토큰은 백엔드 확인에서 걸러진다', async ({ page }) => {
    await setAuthCookie(page, createAdminAccessToken());
    await page.goto(PRESENTER);
    await expect(page).toHaveURL(/\/login\?redirect=/);
    const deck = await page.request.get(`${PRESENTER}/deck`);
    expect(deck.status()).toBe(401);
  });

  test('관리자는 지금 장·다음 장·대본을 보고 넘길 수 있다', async ({ page }) => {
    await setAuthCookie(page, createVerifiedAdminAccessToken());
    await page.setViewportSize({ width: 1180, height: 820 });
    await page.goto(PRESENTER);

    await expect(page.getByTestId('presenter')).toBeVisible();
    await expect(page.getByTestId('presenter-position')).toHaveText('1');
    await expect(page.getByTestId('presenter-script')).toHaveText(
      '첫 장 대본입니다. 두 번째 문장입니다.'
    );
    await expect(page.getByTestId('presenter-next-title')).toHaveText('2. 시험용 둘째 장');
    await expect(page.getByText('손을 들어 봅니다.')).toBeVisible();
    await expect(page.getByTestId('presenter-current').locator('canvas')).toBeVisible();
    await expect(page.getByTestId('presenter-next').locator('canvas')).toBeVisible();

    await page.getByRole('button', { name: '다음 →' }).click();
    await expect(page.getByTestId('presenter-position')).toHaveText('2');
    await expect(page).toHaveURL(/#2$/);
    await expect(page.getByTestId('presenter-script')).toContainText('둘째 장 대본');
    await expect(page.getByText('강사용 장')).toBeVisible();
    await expect(page.getByText('요청문 예시를 보냅니다.')).toBeVisible();
    await expect(page.getByText('여기서부터 PART 2 · 시험')).toBeVisible();

    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId('presenter-position')).toHaveText('3');
    await expect(page.getByText('마지막 장입니다.')).toBeVisible();

    await page.getByRole('combobox', { name: '장 바로 가기' }).selectOption('1');
    await expect(page.getByTestId('presenter-position')).toHaveText('1');

    // 아이패드 가로 화면에서 페이지 전체가 넘치지 않고 넘기기 버튼이 화면 안에 있다.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
    await expect(page.getByRole('button', { name: '다음 →' })).toBeInViewport();
  });

  test('관리자에게는 강사용 PDF를 캐시 없이 내준다', async ({ page }) => {
    await setAuthCookie(page, createVerifiedAdminAccessToken());
    const deck = await page.request.get(`${PRESENTER}/deck`);
    expect(deck.status()).toBe(200);
    expect(deck.headers()['content-type']).toBe('application/pdf');
    expect(deck.headers()['cache-control']).toContain('no-store');
    expect((await deck.body()).subarray(0, 5).toString()).toBe('%PDF-');
  });
});
