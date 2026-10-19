import { expect, test } from '@playwright/test';
import {
  HANSALIM_DOWNLOADS,
  HANSALIM_RELEASE,
} from '../src/widgets/lecture/model/hansalimDownloads';

const pdf = HANSALIM_DOWNLOADS.find(item => item.key === 'pdf');
// 자료 페이지와 같은 규칙(파일 해시 앞 16자를 붙인 같은 출처 주소)으로 PDF를 읽는다.
const pdfHref = `/hansalim/files/${encodeURIComponent(pdf?.file ?? '')}?v=${pdf?.sha256.slice(0, 16)}`;

test.describe('한살림 강의 슬라이드 보기', () => {
  test('자료 페이지에서 슬라이드 보기로 들어가 키보드로 넘긴다', async ({ page }) => {
    await page.goto('/hansalim');
    await page.getByTestId('lecture-slides-link').click();
    await expect(page).toHaveURL(/\/hansalim\/slides/);
    // 슬라이드는 발표 화면이라 블로그 메뉴 없이 단독으로 연다.
    await expect(page.getByTestId('nav-link-blog')).toHaveCount(0);

    const current = page.getByTestId('slideshow-current');
    await expect(current.locator('canvas')).toBeVisible({ timeout: 20_000 });
    await expect(current).toHaveAttribute('data-slide', '1');
    // 자료 페이지와 같은 자료 묶음의 PDF이고, 장수가 manifest와 같아야 한다.
    await expect(page.getByTestId('slideshow')).toHaveAttribute(
      'data-release-id',
      HANSALIM_RELEASE.releaseId
    );
    await expect(page.getByTestId('slideshow')).toContainText(`1 / ${HANSALIM_RELEASE.slides}`);

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
    await expect(current).toHaveAttribute('data-slide', String(HANSALIM_RELEASE.slides));
    await expect(current.locator('canvas')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('slideshow')).toContainText(
      `${HANSALIM_RELEASE.slides} / ${HANSALIM_RELEASE.slides}`
    );
  });

  test('가운데 장도 주소의 번호로 바로 열린다', async ({ page }) => {
    const middle = Math.ceil(HANSALIM_RELEASE.slides / 2);
    await page.goto(`/hansalim/slides#${middle}`);
    const current = page.getByTestId('slideshow-current');
    await expect(current).toHaveAttribute('data-slide', String(middle), { timeout: 20_000 });
    await expect(current.locator('canvas')).toBeVisible();
  });

  test('슬라이드 속 영상 링크를 누르면 새 탭으로 열리고 장은 넘어가지 않는다', async ({
    page,
    context,
  }) => {
    // 바깥 사이트로 실제로 나가지 않게 막고, 새 탭에 열린 주소만 확인한다.
    await context.route(/youtube\.com/, route =>
      route.fulfill({ contentType: 'text/html', body: '<p>video</p>' })
    );
    // 9장은 지금 자료에서 공식 소개 영상 세 편을 모아 둔 장이다.
    await page.goto('/hansalim/slides#9');
    const current = page.getByTestId('slideshow-current');
    await expect(current).toHaveAttribute('data-slide', '9', { timeout: 20_000 });

    const video = current.locator('.annotationLayer a[href*="youtube.com"]').first();
    await expect(video).toHaveAttribute('target', '_blank');
    await expect(video).toHaveAttribute('rel', /noopener/);
    const [popup] = await Promise.all([context.waitForEvent('page'), video.click()]);
    expect(popup.url()).toContain('youtube.com');
    await expect(current).toHaveAttribute('data-slide', '9');
    await expect(page).toHaveURL(/#9$/);

    // 미리 그려 둔 앞뒤 장에는 링크 층을 두지 않아 Tab 순서에 끼지 않는다.
    await expect(page.locator('[data-slide][aria-hidden="true"] .annotationLayer a')).toHaveCount(
      0
    );
  });

  test('키를 빠르게 여러 번 눌러도 누른 만큼 넘어간다', async ({ page }) => {
    await page.goto('/hansalim/slides');
    const current = page.getByTestId('slideshow-current');
    await expect(current).toHaveAttribute('data-slide', '1', { timeout: 20_000 });

    // 화면이 다시 그려지기를 기다리지 않고 연달아 누른다.
    await page.evaluate(() => {
      for (let i = 0; i < 3; i += 1) {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      }
    });
    await expect(current).toHaveAttribute('data-slide', '4');
    await expect(page).toHaveURL(/#4$/);
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
    const download = page.getByRole('link', { name: 'PDF 받기' });
    await expect(download).toHaveAttribute('href', pdfHref);
    await expect(download).toHaveAttribute('download', pdf?.file ?? '');
  });
});

test.describe('한살림 강의 슬라이드 보기 · 손가락 화면', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test('슬라이드 속 링크는 누르는 영역이 위아래로 넓다', async ({ page }) => {
    await page.goto('/hansalim/slides#9');
    const current = page.getByTestId('slideshow-current');
    await expect(current).toHaveAttribute('data-slide', '9', { timeout: 20_000 });

    const link = current.locator('.annotationLayer .linkAnnotation').first();
    const [area, anchor] = [await link.boundingBox(), await link.locator('a').boundingBox()];
    // 글자 높이(몇 px)만큼이던 링크가 위아래 8px씩 넓어져야 손가락으로 누를 수 있다.
    expect((anchor?.height ?? 0) - (area?.height ?? 0)).toBeGreaterThanOrEqual(15);
  });
});
