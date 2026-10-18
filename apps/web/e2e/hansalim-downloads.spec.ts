import { createHash } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { HANSALIM_DOWNLOADS } from '../src/widgets/lecture/model/hansalimDownloads';
import { HANSALIM_LECTURE } from '../src/widgets/lecture/model/hansalimLecture';

test.describe('한살림 교육 다운로드 페이지', () => {
  test('네 파일을 manifest와 같은 내용·이름으로 내려준다', async ({ page, request }) => {
    await page.goto('/hansalim');

    for (const item of HANSALIM_DOWNLOADS) {
      const link = page
        .getByTestId(`lecture-download-${item.key}`)
        .getByRole('link', { name: /내려받기/ });
      await expect(link).toHaveAttribute('download', item.file);

      const response = await request.get((await link.getAttribute('href')) ?? '');
      expect(response.status(), item.file).toBe(200);
      const sha256 = createHash('sha256')
        .update(await response.body())
        .digest('hex');
      expect(sha256, item.file).toBe(item.sha256);
    }
  });

  test('실습 자료를 가장 먼저 보여 주고 PPT 안내가 글꼴로 이어진다', async ({ page }) => {
    await page.goto('/hansalim');

    await expect(page.getByRole('heading', { level: 1 })).toContainText('한살림성남용인');
    const cards = page.locator('[data-testid^="lecture-download-"]');
    await expect(cards.first()).toHaveAttribute('data-testid', 'lecture-download-lab');

    await page.getByRole('link', { name: '글꼴 받으러 가기' }).click();
    await expect(page).toHaveURL(/#download-font$/);
    await expect(page.locator('#download-font')).toBeInViewport();
  });

  test('사이트 공통 틀과 추적 없이 강사 소개를 함께 보여 준다', async ({ page }) => {
    await page.goto('/hansalim');

    await expect(page.getByTestId('sidebar-toggle')).toHaveCount(0);
    await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(0);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await expect(page.locator('#instructor')).toContainText('김승찬');
    // 후기는 교육이 끝나고 글을 올린 뒤(hansalimLecture.ts의 review를 채운 뒤)에만 보인다.
    const review = page.getByTestId('lecture-review');
    if (HANSALIM_LECTURE.review) {
      await expect(review.getByRole('link')).toHaveAttribute(
        'href',
        HANSALIM_LECTURE.review.postPath
      );
    } else {
      await expect(review).toHaveCount(0);
    }
  });

  test('휴대폰 폭에서 가로로 넘치지 않고 버튼이 한 줄씩 보인다', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/hansalim');

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
    for (const item of HANSALIM_DOWNLOADS) {
      const card = page.getByTestId(`lecture-download-${item.key}`);
      const button = card.getByRole('link', { name: /내려받기/ });
      const [buttonBox, cardBox] = [await button.boundingBox(), await card.boundingBox()];
      // 버튼이 카드 안쪽 폭을 거의 다 차지해야 한 줄에 하나씩, 누르기 쉽게 보인다.
      expect((buttonBox?.width ?? 0) / (cardBox?.width ?? 1), item.file).toBeGreaterThan(0.8);
      expect(buttonBox?.height ?? 0, item.file).toBeGreaterThanOrEqual(44);
    }
  });

  test('예전 강사 프로필 주소는 더 이상 열리지 않는다', async ({ request }) => {
    const response = await request.get('/info/instructor', { maxRedirects: 0 });
    expect(response.status()).toBe(404);
  });
});
