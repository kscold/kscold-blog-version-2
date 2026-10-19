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

    await page.getByRole('link', { name: 'PPT용 글꼴 보기' }).click();
    await expect(page).toHaveURL(/#download-font$/);
    await expect(page.locator('#download-font')).toBeInViewport();
  });

  test('Windows·Mac 실습 준비 순서를 나란히 보여 주고 글꼴 단계는 선택으로 표시한다', async ({
    page,
  }) => {
    await page.goto('/hansalim');

    await page.getByRole('link', { name: 'Windows·Mac 순서 보기' }).click();
    await expect(page).toHaveURL(/#setup$/);
    await expect(page.getByTestId('lecture-setup')).toBeInViewport();

    const windows = page.getByTestId('lecture-setup-windows');
    const mac = page.getByTestId('lecture-setup-mac');
    await expect(windows.getByRole('listitem')).toHaveCount(4);
    await expect(mac.getByRole('listitem')).toHaveCount(4);
    await expect(windows).toContainText('모두 압축 풀기');
    // 메뉴 사이에는 화면 낭독기용 「, 다음」이 들어가므로 보이는 메뉴 이름만 순서대로 확인한다.
    await expect(windows.getByRole('listitem').nth(2).locator('[data-menu-part]')).toHaveText([
      '파일',
      '폴더 열기',
      '바탕 화면',
      '한살림_AI실습',
      '폴더 선택',
    ]);
    await expect(mac.getByRole('listitem').nth(2).locator('[data-menu-part]')).toHaveText([
      '파일',
      '폴더 열기',
      '데스크탑',
      '한살림_AI실습',
      '열기',
    ]);
    await expect(mac).toContainText('서체 관리자에서 설치');
    await expect(windows.getByRole('listitem').last()).toContainText('선택');
    await expect(page.getByTestId('lecture-setup')).toContainText('신뢰를 누릅니다');

    await windows.getByRole('link', { name: 'PPT용 글꼴 받기' }).click();
    await expect(page).toHaveURL(/#download-font$/);
  });

  test('블로그 틀 안에서 GA·방문 기록 없이 강사 소개를 함께 보여 준다', async ({ page }) => {
    const visits: string[] = [];
    await page.route('**/analytics/page-visit', route => {
      visits.push(route.request().postData() ?? '');
      return route.fulfill({ contentType: 'application/json', body: '{"success":true}' });
    });
    // 대조용: 다른 공개 화면은 방문 기록을 보낸다. 로그인 버튼이 보이면 화면의 effect가 다 돈 뒤다.
    await page.goto('/privacy');
    await expect(page.getByTestId('header-login-btn')).toBeVisible();
    await expect.poll(() => visits.length).toBe(1);

    await page.goto('/hansalim');
    await expect(page.getByTestId('header-login-btn')).toBeVisible();
    await expect(page.getByText('개발자 김승찬이 운영하는 기술 블로그입니다.')).toBeAttached();
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

    // 블로그 메뉴로 옮겨 가면 그 화면만 기록된다. 사이에 한살림 방문 기록이 끼면 실패한다.
    await page.getByTestId('nav-link-blog').click();
    await expect(page).toHaveURL(/\/blog$/);
    await expect
      .poll(() => visits.map(body => JSON.parse(body).path))
      .toEqual(['/privacy', '/blog']);
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

  test('주소를 잘못 치거나 한글로 쳐도 자료 페이지로 간다', async ({ request }) => {
    // 자료 페이지 자체는 이동 없이 바로 열려야 한다(대소문자 변형을 넣으면 자기 자신으로 무한 이동했다).
    const self = await request.get('/hansalim', { maxRedirects: 0 });
    expect(self.status()).toBe(200);

    for (const path of ['/hansailm', '/hanslim', '/hansarim', `/${encodeURIComponent('한살림')}`]) {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status(), path).toBe(307);
      expect(response.headers().location, path).toBe('/hansalim');
    }
  });

  test('예전 강사 프로필 주소는 더 이상 열리지 않는다', async ({ request }) => {
    const response = await request.get('/info/instructor', { maxRedirects: 0 });
    expect(response.status()).toBe(404);
  });
});
