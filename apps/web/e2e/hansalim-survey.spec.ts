import { expect, test } from '@playwright/test';

for (const { screen, viewport } of [
  { screen: '휴대폰', viewport: { width: 390, height: 844 } },
  { screen: '데스크톱', viewport: { width: 1440, height: 960 } },
]) {
  test(`${screen} 설문: 실패 후 재시도, 완료 화면, 새로고침 후 중복 방지`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const payloads: Array<{ submissionId: string; ratings: Record<string, number> }> = [];
    await page.route('**/api/lectures/hansalim/feedback', async route => {
      payloads.push(route.request().postDataJSON());
      await route.fulfill({
        status: payloads.length === 1 ? 503 : 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: payloads.length > 1 }),
      });
    });
    await page.goto('/hansalim/survey');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('어떠셨나요');
    await expect(page.locator('input:checked')).toHaveCount(0);
    await page.getByRole('button', { name: '의견 보내기' }).click();
    expect(payloads).toHaveLength(0);
    for (const key of ['satisfaction', 'understanding', 'usefulness', 'instruction']) {
      const radio = page.locator(`input[name="${key}"][value="4"]`);
      // 빈 설문 제출 뒤 스크롤 중일 수 있으므로 숨긴 입력을 강제 클릭하지 않고,
      // 보이는 선택지가 안정되고 클릭을 받을 수 있을 때 실제 사용자처럼 선택한다.
      await page.locator('label').filter({ has: radio }).click();
      await expect(radio).toBeChecked();
    }
    await page.getByLabel('적당했어요', { exact: true }).check();
    await page.getByLabel('업무 자료 실습', { exact: true }).check();
    await page.getByLabel('다음 강의를 위해 한마디 남겨주세요').fill('업무에 적용할 방법을 알게 되었어요.');
    await expect(page.getByText('5 / 5 완료')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await page.getByRole('button', { name: '의견 보내기' }).click();
    await expect(page.getByRole('alert').filter({ hasText: '저장하지 못했어요' })).toBeVisible();
    await expect(page.getByLabel('다음 강의를 위해 한마디 남겨주세요')).toHaveValue('업무에 적용할 방법을 알게 되었어요.');
    await page.getByRole('button', { name: '의견 보내기' }).click();
    await expect(page.getByRole('heading', { name: '의견을 잘 받았어요' })).toBeVisible();
    expect(payloads).toHaveLength(2);
    expect(payloads[0].ratings).toEqual({
      satisfaction: 4, understanding: 4, usefulness: 4, instruction: 4,
    });
    expect(payloads[0].submissionId).toBeTruthy();
    expect(payloads[1]).toEqual(payloads[0]);
    await page.reload();
    await expect(page.getByRole('heading', { name: '의견을 잘 받았어요' })).toBeVisible();
  });
}

test('자료 페이지 설문 링크와 추적 없는 데스크톱 설문', async ({ page }) => {
  await page.goto('/hansalim');
  await page.getByRole('link', { name: /강의 만족도 조사/ }).click();
  await expect(page).toHaveURL(/\/hansalim\/survey$/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('script[src*="googletagmanager"], script[src*="adsbygoogle"]')).toHaveCount(0);
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '0');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});
