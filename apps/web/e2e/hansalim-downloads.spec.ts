import { createHash } from 'node:crypto';
import { expect, test, type APIRequestContext } from '@playwright/test';
import {
  HANSALIM_DOWNLOADS,
  HANSALIM_RELEASE,
  type HansalimDownload,
} from '../src/widgets/lecture/model/hansalimDownloads';
import { HANSALIM_LECTURE } from '../src/widgets/lecture/model/hansalimLecture';

const visible = HANSALIM_DOWNLOADS.filter(item => !item.hidden);
const hidden = HANSALIM_DOWNLOADS.filter(item => item.hidden);

/** 받은 파일이 manifest와 같은 크기·해시이고, 주소를 직접 열어도 원래 이름으로 저장되는지 본다. */
async function expectSameFile(request: APIRequestContext, href: string, item: HansalimDownload) {
  const response = await request.get(href);
  expect(response.status(), item.file).toBe(200);
  expect(response.headers()['content-disposition'], item.file).toBe(
    `attachment; filename*=UTF-8''${encodeURIComponent(item.file)}`
  );
  const body = await response.body();
  expect(body.length, item.file).toBe(item.bytes);
  expect(createHash('sha256').update(body).digest('hex'), item.file).toBe(item.sha256);
}

test.describe('한살림 교육 다운로드 페이지', () => {
  test('보이는 세 파일과 예전 글꼴 주소를 manifest와 같은 내용·이름으로 내려준다', async ({
    page,
    request,
  }) => {
    await page.goto('/hansalim');
    await expect(page.locator('article[data-release-id]')).toHaveAttribute(
      'data-release-id',
      HANSALIM_RELEASE.releaseId
    );
    await expect(page.locator('[data-testid^="lecture-download-"]')).toHaveCount(visible.length);

    for (const item of visible) {
      const link = page.getByTestId(`lecture-download-${item.key}`).getByRole('link');
      await expect(link).toHaveAttribute('download', item.file);
      const href = (await link.getAttribute('href')) ?? '';
      expect(href, item.file).toContain(`?v=${item.sha256.slice(0, 16)}`);
      await expectSameFile(request, href, item);
    }
    // 화면에서 뺀 예전 글꼴 ZIP도 옛 주소(버전 질의 없이)로 그대로 받을 수 있어야 한다.
    for (const item of hidden) {
      await expectSameFile(request, `/hansalim/files/${encodeURIComponent(item.file)}`, item);
    }
    // 없는 파일에 페이지 HTML을 200으로 내주면 깨진 파일이 내려받아진다.
    const missing = await request.get(`/hansalim/files/${encodeURIComponent('없는자료.zip')}`);
    expect(missing.status()).toBe(404);
  });

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1366, height: 768 },
  ]) {
    test(`${viewport.width}×${viewport.height} 첫 화면에 실습 자료 받기 버튼과 가벼운 안내 문장이 있다`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto('/hansalim');

      await expect(page.getByRole('heading', { level: 1 })).toContainText('한살림성남용인');
      const button = page.getByTestId('lecture-primary-download');
      await expect(button).toBeInViewport({ ratio: 1 });
      await expect(button).toHaveAttribute('download', visible[0].file);
      expect((await button.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(48);

      // 안내 문장은 배경·테두리·여백 상자 없이 보통 굵기의 본문 크기로 둔다.
      const intro = page.getByTestId('lecture-intro');
      await expect(intro).toHaveText(HANSALIM_LECTURE.intro);
      const style = await intro.evaluate(node => {
        const computed = getComputedStyle(node);
        return {
          weight: Number(computed.fontWeight),
          size: Number.parseFloat(computed.fontSize),
          background: computed.backgroundColor,
          border: computed.borderLeftWidth,
          padding: computed.paddingLeft,
        };
      });
      expect(style.weight).toBeLessThan(600);
      expect(style.size).toBeGreaterThanOrEqual(16);
      expect(style.size).toBeLessThanOrEqual(18);
      expect(style).toMatchObject({
        background: 'rgba(0, 0, 0, 0)',
        border: '0px',
        padding: '0px',
      });
    });
  }

  test('실습 준비는 Windows를 먼저 보여 주고 키보드로 Mac 안내로 바꿀 수 있다', async ({
    page,
  }) => {
    await page.goto('/hansalim');
    await page.getByRole('link', { name: '준비 방법 보기' }).click();
    await expect(page).toHaveURL(/#setup$/);
    await expect(page.getByRole('heading', { name: '실습 준비' })).toBeInViewport();

    const windowsTab = page.getByRole('tab', { name: 'Windows' });
    const macTab = page.getByRole('tab', { name: 'Mac' });
    const windows = page.getByTestId('lecture-setup-windows');
    const mac = page.getByTestId('lecture-setup-mac');
    await expect(windowsTab).toHaveAttribute('aria-selected', 'true');
    await expect(windows).toBeVisible();
    await expect(mac).toBeHidden();
    await expect(windows.getByRole('listitem')).toHaveCount(3);
    await expect(windows.getByRole('listitem').first()).toContainText(visible[0].file);
    await expect(windows).toContainText('모두 압축 풀기');
    // 메뉴 사이에는 화면 낭독기용 「, 다음」이 들어가므로 보이는 메뉴 이름만 순서대로 확인한다.
    await expect(windows.getByRole('listitem').nth(2).locator('[data-menu-part]')).toHaveText([
      '파일',
      '폴더 열기',
      '바탕 화면',
      '한살림_AI실습',
      '폴더 선택',
    ]);

    await windowsTab.focus();
    await page.keyboard.press('ArrowRight');
    await expect(macTab).toBeFocused();
    await expect(macTab).toHaveAttribute('aria-selected', 'true');
    await expect(mac).toBeVisible();
    await expect(windows).toBeHidden();
    await expect(mac).toContainText('브라우저에서 이미 풀었다면 생긴 폴더를 사용합니다.');
    await expect(mac.getByRole('listitem').nth(2).locator('[data-menu-part]')).toHaveText([
      '파일',
      '폴더 열기',
      '데스크탑',
      '한살림_AI실습',
      '열기',
    ]);
    await page.keyboard.press('Home');
    await expect(windowsTab).toBeFocused();
    await expect(windows).toBeVisible();

    const setup = page.getByTestId('lecture-setup');
    await expect(setup).toContainText(HANSALIM_LECTURE.setup.done);
    await expect(setup).toContainText('ZIP 안에서 바로 열지 말고');
    await expect(setup).toContainText('이 페이지에서 받은 수업 폴더인지 확인한 뒤');
    const tree = page.getByTestId('lecture-folder-tree');
    await expect(tree).toContainText('NotoSansKR-Regular.ttf');
    await expect(tree).toContainText('실습길잡이.pdf');
    await expect(tree).toContainText('복사해서 보낼 요청문');
  });

  test('실습 준비 다음에 자료 목록과 강사 소개가 이어진다', async ({ page }) => {
    await page.goto('/hansalim');
    const order = await page.evaluate(() =>
      ['setup', 'downloads', 'instructor'].map(
        id => document.getElementById(id)?.getBoundingClientRect().top ?? -1
      )
    );
    expect(order[0]).toBeGreaterThan(0);
    expect(order).toEqual([...order].sort((a, b) => a - b));
    await expect(page.locator('[data-testid^="lecture-download-"]').first()).toHaveAttribute(
      'data-testid',
      'lecture-download-lab'
    );
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

  for (const width of [320, 375]) {
    test(`휴대폰 폭 ${width}px에서 가로로 넘치지 않고 버튼이 한 줄씩 크게 보인다`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 812 });
      await page.goto('/hansalim');

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth
      );
      expect(overflow).toBeLessThanOrEqual(0);
      for (const item of visible) {
        const row = page.getByTestId(`lecture-download-${item.key}`);
        const button = row.getByRole('link');
        const [buttonBox, rowBox] = [await button.boundingBox(), await row.boundingBox()];
        // 버튼이 행 폭을 거의 다 차지해야 한 줄에 하나씩, 누르기 쉽게 보인다.
        expect((buttonBox?.width ?? 0) / (rowBox?.width ?? 1), item.file).toBeGreaterThan(0.8);
        expect(buttonBox?.height ?? 0, item.file).toBeGreaterThanOrEqual(48);
      }
    });
  }

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
