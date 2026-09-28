import { expect, test } from '@playwright/test';
import { mockShellApis, success } from './support/api';
import { createAdminAccessToken, seedAdminSession, seedSession } from './support/auth';
import { mockPrivatePdf, PRIVATE_PDF_TEXT, PRIVATE_PDF_TITLE } from './support/privatePdf';

test.use({ navigationTimeout: 30_000 });
test.setTimeout(60_000);

test.describe('비공개 PDF 뷰어 권한과 안전한 오류 처리', () => {
  test.beforeEach(async ({ page }) => {
    await mockShellApis(page);
  });

  test('비로그인은 PDF 메타데이터와 원본을 요청하지 않는다', async ({ page }) => {
    let requests = 0;
    await mockPrivatePdf(page, { onRequest: () => { requests += 1; } });
    await page.goto('/admin/documents/doc-1/view');
    await expect(page).toHaveURL(/\/login/);
    expect(requests).toBe(0);
    await expect(page.locator('[data-cy="admin-document-viewer"] canvas')).toHaveCount(0);
  });

  test('일반 회원은 PDF 메타데이터와 원본을 요청하지 않는다', async ({ page }) => {
    let requests = 0;
    await seedSession(page, {
      id: 'viewer-user', username: 'visitor', email: 'visitor@example.test',
      displayName: '일반 회원', role: 'USER',
    });
    await mockPrivatePdf(page, { onRequest: () => { requests += 1; } });
    await page.goto('/admin/documents/doc-1/view');
    await expect(page).toHaveURL(/\/login/);
    expect(requests).toBe(0);
  });

  test('쿠키만 남은 관리자는 서버가 역할을 확인한 후 PDF를 가져온다', async ({ page }) => {
    await page.context().addCookies([{
      name: 'auth-token', value: createAdminAccessToken(), httpOnly: true,
      url: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3101',
    }]);
    let isVerified = false;
    await page.route('**/api/auth/me', async route => {
      isVerified = true;
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify(success({
          id: 'cookie-viewer-admin', username: 'kscold', displayName: '검증 관리자',
          email: 'viewer@example.test', role: 'ADMIN',
        })),
      });
    });
    await mockPrivatePdf(page, { onRequest: () => { expect(isVerified).toBe(true); } });
    await page.goto('/admin/documents/doc-1/view');
    await expect(page.locator('[data-cy="pdf-page-1"] canvas')).toBeVisible();
    expect(isVerified).toBe(true);
  });

  test('HTML 원본은 실행하거나 인라인으로 삽입하지 않고 안전한 오류를 표시한다', async ({ page }) => {
    await seedAdminSession(page);
    await mockPrivatePdf(page, {
      buffer: Buffer.from('<html><script>window.privatePdfExecuted = true</script>private raw error</html>'),
    });
    await page.goto('/admin/documents/doc-1/view');
    await expect(page.locator('[data-cy="pdf-viewer-error"]')).toBeVisible();
    await expect(page.locator('iframe, object, embed')).toHaveCount(0);
    await expect(page.locator('[data-cy="admin-document-viewer"] canvas')).toHaveCount(0);
    expect(await page.evaluate(() => 'privatePdfExecuted' in window)).toBe(false);
    await expect(page.locator('body')).not.toContainText('private raw error');
  });

  test('손상된 PDF는 파서 내부 오류를 노출하지 않는다', async ({ page }) => {
    await seedAdminSession(page);
    await mockPrivatePdf(page, { buffer: Buffer.from('%PDF-1.4\nprivate malformed PDF secret') });
    await page.goto('/admin/documents/doc-1/view');
    await expect(page.locator('[data-cy="pdf-viewer-error"]')).toBeVisible();
    await expect(page.locator('[data-cy="admin-document-viewer"] canvas')).toHaveCount(0);
    await expect(page.locator('body')).not.toContainText('private malformed PDF secret');
  });

  test('PDF가 아닌 메타데이터의 파일은 원본을 뷰어로 가져오지 않는다', async ({ page }) => {
    await seedAdminSession(page);
    let downloads = 0;
    await mockPrivatePdf(page, {
      document: { fileName: 'private.html', contentType: 'text/html' },
      onRequest: request => { if (request.url().endsWith('/download')) downloads += 1; },
    });
    await page.goto('/admin/documents/doc-1/view');
    await expect(page.locator('[data-cy="pdf-viewer-error"]')).toBeVisible();
    expect(downloads).toBe(0);
    await expect(page.locator('iframe, object, embed')).toHaveCount(0);
  });

  test('일시적인 원본 조회 실패는 다시 시도로 복구한다', async ({ page }) => {
    await seedAdminSession(page);
    await mockPrivatePdf(page, { failDownloadOnce: true });
    await page.goto('/admin/documents/doc-1/view');
    await expect(page.locator('[data-cy="pdf-viewer-error"]')).toBeVisible();
    await page.locator('[data-cy="pdf-viewer-retry"]').click();
    await expect(page.locator('[data-cy="pdf-page-1"] canvas')).toBeVisible();
    await expect(page.locator('[data-cy="pdf-viewer-error"]')).toHaveCount(0);
  });

  test('삭제되었거나 접근할 수 없는 문서는 원본을 가져오지 않는다', async ({ page }) => {
    await seedAdminSession(page);
    let downloads = 0;
    await mockPrivatePdf(page, {
      document: { id: 'different-document' },
      onRequest: request => { if (request.url().endsWith('/download')) downloads += 1; },
    });
    await page.goto('/admin/documents/doc-1/view');
    await expect(page.locator('[data-cy="pdf-viewer-error"]')).toBeVisible();
    expect(downloads).toBe(0);
    await expect(page.locator('body')).not.toContainText(PRIVATE_PDF_TITLE);
  });

  test('개인 문서 내용은 브라우저 저장소와 페이지 메타데이터에 남지 않는다', async ({ page }) => {
    await seedAdminSession(page);
    await mockPrivatePdf(page);
    await page.goto('/admin/documents/doc-1/view');
    await expect(page.locator('[data-cy="pdf-page-1"]')).toContainText(PRIVATE_PDF_TEXT);
    const storage = await page.evaluate(() => ({
      local: Object.values(localStorage).join('\n'),
      session: Object.values(sessionStorage).join('\n'),
    }));
    for (const content of Object.values(storage)) {
      expect(content).not.toContain(PRIVATE_PDF_TEXT);
      expect(content).not.toContain(PRIVATE_PDF_TITLE);
      expect(content).not.toContain('private-viewer-test.pdf');
    }
    await expect(page).toHaveTitle(/PDF.*KSCOLD|문서.*KSCOLD/);
    expect(await page.title()).not.toContain(PRIVATE_PDF_TITLE);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });

  test('PDF 워커·폰트와 원본은 외부 뷰어나 CDN에 전송하지 않는다', async ({ page }) => {
    await seedAdminSession(page);
    await mockPrivatePdf(page);
    const externalHosts: string[] = [];
    const origin = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3101').origin;
    page.on('request', request => {
      const url = new URL(request.url());
      if (['http:', 'https:'].includes(url.protocol) && url.origin !== origin) {
        externalHosts.push(url.hostname);
      }
    });
    await page.goto('/admin/documents/doc-1/view');
    await expect(page.locator('[data-cy="pdf-page-1"]')).toContainText(PRIVATE_PDF_TEXT);
    await page.locator('[data-cy="pdf-viewer-next"]').click();
    await expect(page.locator('[data-cy="pdf-page-2"]')).toContainText(PRIVATE_PDF_TEXT);
    expect(externalHosts).toEqual([]);
  });

  test('다른 탭에서 로그아웃이 전달되면 캔버스와 문서 화면을 제거한다', async ({ page }) => {
    await seedAdminSession(page);
    await mockPrivatePdf(page);
    await page.goto('/admin/documents/doc-1/view');
    await expect(page.locator('[data-cy="pdf-page-1"] canvas')).toBeVisible();
    await page.evaluate(() => {
      const loggedOut = JSON.stringify({ state: { user: null }, version: 0 });
      localStorage.setItem('auth-storage', loggedOut);
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'auth-storage', newValue: loggedOut, storageArea: localStorage,
      }));
    });
    await expect(page.locator('[data-cy="admin-document-viewer"]')).toHaveCount(0);
    await expect(page.locator('canvas')).toHaveCount(0);
    await expect(page.locator('[data-cy="admin-documents-auth-required"]')).toBeVisible();
    const storage = await page.evaluate(() => Object.values(localStorage).join('\n'));
    expect(storage).not.toContain(PRIVATE_PDF_TEXT);
  });

  test('다른 관리자 계정으로 바뀌면 이전 계정의 PDF를 남기지 않는다', async ({ page }) => {
    await seedAdminSession(page);
    let downloads = 0;
    await mockPrivatePdf(page, { onRequest: request => {
      if (request.url().endsWith('/download')) downloads += 1;
    } });
    await page.goto('/admin/documents/doc-1/view');
    await expect(page.locator('[data-cy="pdf-page-1"] canvas')).toBeVisible();
    await page.evaluate(() => {
      const changedAccount = JSON.stringify({
        state: { user: { id: 'other-admin', role: 'ADMIN' } }, version: 0,
      });
      localStorage.setItem('auth-storage', changedAccount);
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'auth-storage', newValue: changedAccount, storageArea: localStorage,
      }));
    });
    await expect(page.locator('[data-cy="admin-document-viewer"]')).toHaveCount(0);
    await expect(page.locator('canvas')).toHaveCount(0);
    await expect(page.locator('[data-cy="admin-documents-auth-required"]')).toBeVisible();
    expect(downloads).toBe(1);
  });

  test('페이지 복원 전에 문서를 지우고 복원 시 서버 세션을 다시 확인한다', async ({ page }) => {
    await seedAdminSession(page);
    await mockPrivatePdf(page);
    await page.goto('/admin/documents/doc-1/view');
    await expect(page.locator('[data-cy="pdf-page-1"] canvas')).toBeVisible();
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })));
    await expect(page.locator('[data-cy="admin-document-viewer"]')).toHaveCount(0);
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
    await expect(page.locator('[data-cy="pdf-page-1"] canvas')).toBeVisible();
  });

  test('복귀할 때 만료된 세션은 이전 PDF를 재표시하지 않는다', async ({ page }) => {
    await seedAdminSession(page);
    let downloads = 0;
    await mockPrivatePdf(page, { onRequest: request => {
      if (request.url().endsWith('/download')) downloads += 1;
    } });
    await page.goto('/admin/documents/doc-1/view');
    await expect(page.locator('[data-cy="pdf-page-1"] canvas')).toBeVisible();
    expect(downloads).toBe(1);
    await page.route('**/api/auth/me', route => route.fulfill({
      status: 401, contentType: 'application/json', body: '{"success":false}',
    }));
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await expect(page.locator('[data-cy="pdf-viewer-error"]')).toBeVisible();
    await expect(page.locator('[data-cy="admin-document-viewer"]')).toHaveCount(0);
    await expect(page.locator('canvas')).toHaveCount(0);
    expect(downloads).toBe(1);
  });
});
