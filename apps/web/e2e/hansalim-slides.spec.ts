import { expect, test } from '@playwright/test';
import { HANSALIM_DOWNLOADS } from '../src/widgets/lecture/model/hansalimDownloads';

const pdf = HANSALIM_DOWNLOADS.find(item => item.key === 'pdf');

test.describe('한살림 강의 슬라이드 보기', () => {
  test('자료 페이지에서 슬라이드 보기로 들어가 키보드로 넘긴다', async ({ page }) => {
    await page.goto('/hansalim');
    await page.getByTestId('lecture-slides-link').click();
    await expect(page).toHaveURL(/\/hansalim\/slides/);

    const current = page.getByTestId('slideshow-current');
    await expect(current.locator('canvas')).toBeVisible({ timeout: 20_000 });
    await expect(current).toHaveAttribute('data-slide', '1');
    await expect(page.getByTestId('slideshow')).toContainText(/1 \/ \d+/);

    await page.keyboard.press('ArrowRight');
    await expect(current).toHaveAttribute('data-slide', '2');
    await expect(page).toHaveURL(/#2$/);
    await page.keyboard.press('ArrowLeft');
    await expect(current).toHaveAttribute('data-slide', '1');
    // 버튼을 누른 뒤에도 방향키가 먹고, 버튼에서 누른 Enter는 한 장만 넘긴다.
    await page.getByRole('button', { name: '다음 슬라이드' }).click();
    await expect(current).toHaveAttribute('data-slide', '2');
    await page.keyboard.press('ArrowRight');
    await expect(current).toHaveAttribute('data-slide', '3');
    await page.keyboard.press('Enter');
    await expect(current).toHaveAttribute('data-slide', '4');
    await page.keyboard.press('End');
    await expect(page.getByTestId('slideshow')).toContainText(/(\d+) \/ \1/);
  });

  test('주소의 번호에서 시작하고, 슬라이드가 화면 안에 비율대로 들어간다', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/hansalim/slides#3');

    const current = page.getByTestId('slideshow-current');
    await expect(current).toHaveAttribute('data-slide', '3', { timeout: 20_000 });
    const canvas = current.locator('canvas');
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    expect(box?.width ?? 0).toBeLessThanOrEqual(390);
    expect(box?.width ?? 0).toBeGreaterThan(300);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('번호를 입력해 이동하고 PDF 받기는 같은 파일로 이어진다', async ({ page }) => {
    await page.goto('/hansalim/slides');
    const current = page.getByTestId('slideshow-current');
    await expect(current).toHaveAttribute('data-slide', '1', { timeout: 20_000 });

    await page.getByLabel('이동할 슬라이드 번호').fill('5');
    await page.getByLabel('이동할 슬라이드 번호').press('Enter');
    await expect(current).toHaveAttribute('data-slide', '5');
    await expect(page.getByRole('link', { name: 'PDF 받기' })).toHaveAttribute(
      'href',
      `/hansalim/files/${encodeURIComponent(pdf?.file ?? '')}`
    );
  });
});
