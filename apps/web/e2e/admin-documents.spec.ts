import { test, expect } from '@playwright/test';
import { mockAdminDashboardApis, mockShellApis } from './support/api';
import { seedAdminSession, seedSession } from './support/auth';
import { mockPrivateDocuments, privateDocument } from './support/adminDocuments';

test.describe('관리자 개인 문서함', () => {
  test.beforeEach(async ({ page }) => {
    await mockShellApis(page);
  });

  test('비로그인 방문자는 문서 API를 호출하지 않고 로그인으로 이동한다', async ({ page }) => {
    let requests = 0;
    await mockPrivateDocuments(page, {
      onRequest: () => {
        requests += 1;
      },
    });
    await page.goto('/admin/documents');
    await expect(page).toHaveURL(/\/login\?redirect=%2Fadmin%2Fdocuments/);
    expect(requests).toBe(0);
    await expect(page.locator('[data-testid="admin-documents-page"]')).toHaveCount(0);
  });

  test('일반 회원은 관리자 문서를 조회하지 못한다', async ({ page }) => {
    let requests = 0;
    await seedSession(page, {
      id: 'user-1',
      username: 'visitor',
      email: 'visitor@example.com',
      displayName: '방문자',
      role: 'USER',
    });
    await mockPrivateDocuments(page, {
      onRequest: () => {
        requests += 1;
      },
    });
    await page.goto('/admin/documents');
    await expect(page).toHaveURL(/\/login/);
    expect(requests).toBe(0);
    await expect(page.getByText('2026 이력서', { exact: true })).toHaveCount(0);
  });

  test('대시보드와 관리자 메뉴에서 비공개 문서함에 접근한다', async ({ page }) => {
    await seedAdminSession(page);
    await mockAdminDashboardApis(page);
    await mockPrivateDocuments(page);
    await page.goto('/admin');
    await page.evaluate(() => {
      (window as Window & { documentNavigationMarker?: string }).documentNavigationMarker =
        'old-page';
    });
    const shortcut = page.locator('[data-testid="admin-documents-link"]:visible');
    await expect(shortcut).toHaveCount(1);
    await expect(shortcut).toHaveAttribute('href', '/admin/documents');
    await shortcut.click();
    await expect(page).toHaveURL(/\/admin\/documents$/);
    await expect(page.getByRole('heading', { name: '개인 문서함' })).toBeVisible();
    expect(
      await page.evaluate(
        () => (window as Window & { documentNavigationMarker?: string }).documentNavigationMarker
      )
    ).toBeUndefined();
    await expect(page.locator('[data-testid="admin-documents-sidebar-link"]:visible')).toHaveAttribute(
      'href',
      '/admin/documents'
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });

  test('다중 업로드는 순서대로 처리하고 부분 실패를 파일별로 표시한다', async ({ page }) => {
    const uploadedNames: string[] = [];
    await seedAdminSession(page);
    await mockPrivateDocuments(page, {
      failNames: ['failed.html'],
      onRequest: request => {
        if (request.method() === 'POST')
          uploadedNames.push(request.postData()?.match(/filename="([^"]+)"/)?.[1] ?? '');
      },
    });
    await page.goto('/admin/documents');
    await page.locator('[data-testid="admin-documents-file-input"]').setInputFiles([
      { name: 'career.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 resume') },
      { name: 'failed.html', mimeType: 'text/html', buffer: Buffer.from('<html>resume</html>') },
      { name: 'career.md', mimeType: 'text/markdown', buffer: Buffer.from('# 경력 자료') },
    ]);
    await page.getByLabel('업로드할 문서의 분류').selectOption('CAREER');
    await page.locator('[data-testid="admin-documents-upload-submit"]').click();
    await expect(page.locator('[data-testid="admin-documents-upload-results"]')).toContainText(
      '완료 2개 · 실패 1개'
    );
    expect(uploadedNames).toEqual(['career.pdf', 'failed.html', 'career.md']);
    await expect(page.locator('[data-testid="admin-documents-list"]')).toContainText('career.pdf');
    await expect(page.locator('[data-testid="admin-documents-list"]')).toContainText('career.md');
    await expect(
      page.locator('[data-testid="admin-document-upload-result"]').filter({ hasText: 'failed.html' })
    ).toContainText('테스트 업로드 실패');
    await expect(page.locator('iframe')).toHaveCount(0);
    expect(await page.evaluate(() => Object.values(localStorage).join('\n'))).not.toContain(
      'career.pdf'
    );
  });

  test('동일한 이름으로 올린 파일도 기존 문서를 덮어쓰지 않는다', async ({ page }) => {
    await seedAdminSession(page);
    await mockPrivateDocuments(page, { documents: [privateDocument()] });
    await page.goto('/admin/documents');
    await page
      .locator('[data-testid="admin-documents-file-input"]')
      .setInputFiles({
        name: 'career.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4 new version'),
      });
    await page.locator('[data-testid="admin-documents-upload-submit"]').click();
    await expect(page.locator('[data-testid="admin-documents-list"] article')).toHaveCount(2);
    await expect(page.locator('[data-testid="admin-document-doc-1"]')).toContainText('2026 이력서');
    await expect(page.locator('[data-testid="admin-document-uploaded-2"]')).toContainText('career.pdf');
  });

  test('용량 초과 및 실행 파일은 네트워크 요청 전에 거절한다', async ({ page }) => {
    let uploads = 0;
    await seedAdminSession(page);
    await mockPrivateDocuments(page, {
      onRequest: request => {
        if (request.method() === 'POST') uploads += 1;
      },
    });
    await page.goto('/admin/documents');
    await page.locator('[data-testid="admin-documents-file-input"]').setInputFiles([
      {
        name: 'large.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.alloc(10 * 1024 * 1024 + 1),
      },
      {
        name: 'installer.exe',
        mimeType: 'application/octet-stream',
        buffer: Buffer.from('executable'),
      },
    ]);
    await expect(page.locator('[data-testid="admin-documents-upload-results"]')).toContainText(
      '최대 10 MB'
    );
    await expect(page.locator('[data-testid="admin-documents-upload-results"]')).toContainText(
      '지원하지 않는 파일 형식'
    );
    await expect(page.locator('[data-testid="admin-documents-upload-submit"]')).toBeDisabled();
    expect(uploads).toBe(0);
  });

  test('드래그 앤 드롭으로 원본 파일을 선택할 수 있다', async ({ page }) => {
    await seedAdminSession(page);
    await mockPrivateDocuments(page);
    await page.goto('/admin/documents');
    await page.locator('[data-testid="admin-documents-dropzone"]').evaluate(element => {
      const transfer = new DataTransfer();
      transfer.items.add(new File(['# 자료'], 'dropped.md', { type: 'text/markdown' }));
      element.dispatchEvent(
        new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: transfer })
      );
    });
    await expect(page.locator('[data-testid="admin-documents-upload-results"]')).toContainText(
      'dropped.md'
    );
    await page.locator('[data-testid="admin-documents-upload-submit"]').click();
    await expect(page.locator('[data-testid="admin-documents-list"]')).toContainText('dropped.md');
  });

  test('검색과 분류 및 페이지 이동으로 문서를 정리하고 검색어는 주소에 남기지 않는다', async ({
    page,
  }) => {
    const documents = Array.from({ length: 14 }, (_, index) =>
      privateDocument({
        id: `doc-${index + 1}`,
        title: `경력 정리 ${index + 1}`,
        fileName: `career-${index + 1}.pdf`,
        category: index === 13 ? 'CAREER' : 'RESUME',
      })
    );
    await seedAdminSession(page);
    await mockPrivateDocuments(page, { documents });
    await page.goto('/admin/documents');
    await expect(page.locator('[data-testid="admin-documents-list"] article')).toHaveCount(12);
    await page.getByRole('button', { name: '2페이지로 이동' }).click();
    await expect(page.locator('[data-testid="admin-documents-list"] article')).toHaveCount(2);
    await expect(page.locator('[data-testid="admin-documents-list"]')).toContainText('경력 정리 14');
    await page.getByLabel('분류', { exact: true }).selectOption('CAREER');
    await expect(page.locator('[data-testid="admin-documents-list"] article')).toHaveCount(1);
    await expect(page.getByRole('navigation', { name: '문서 페이지' })).toHaveCount(0);
    await page.getByLabel('문서 검색').fill('없는 개인 검색어');
    await page.locator('[data-testid="admin-documents-search-submit"]').click();
    await expect(page.getByText('조건에 맞는 문서가 없습니다.')).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/documents$/);
    await expect(page).toHaveTitle('개인 문서 관리 | KSCOLD');
    await page.getByRole('button', { name: '검색 초기화' }).click();
    await expect(page.locator('[data-testid="admin-documents-list"] article')).toHaveCount(1);
  });

  test('이름·설명·분류를 수정하고 원본을 다운로드하며 삭제 확인을 거친다', async ({ page }) => {
    await seedAdminSession(page);
    await mockPrivateDocuments(page, { documents: [privateDocument()] });
    await page.goto('/admin/documents');
    await page.locator('[data-testid="admin-document-edit-doc-1"]').click();
    await page.getByLabel('문서 이름').fill('9월 이력서');
    await page.getByLabel('설명', { exact: true }).fill('면접용 최종 정리');
    await page.locator('#document-edit-category').selectOption('PERSONAL');
    await page.locator('[data-testid="admin-document-edit-save"]').click();
    await expect(page.locator('[data-testid="admin-document-doc-1"]')).toContainText('9월 이력서');
    await expect(page.locator('[data-testid="admin-document-doc-1"]')).toContainText(
      '면접용 최종 정리'
    );
    await expect(page.locator('[data-testid="admin-document-doc-1"]')).toContainText('개인 자료');
    const downloadLink = page.locator('[data-testid="admin-document-download-doc-1"]');
    await expect(downloadLink).toHaveAttribute('href', '/api/admin/documents/doc-1/download');
    const downloaded = page.waitForEvent('download');
    await downloadLink.click();
    expect((await downloaded).suggestedFilename()).toBe('career.pdf');
    page.once('dialog', dialog => dialog.dismiss());
    await page.locator('[data-testid="admin-document-delete-doc-1"]').click();
    await expect(page.locator('[data-testid="admin-document-doc-1"]')).toBeVisible();
    page.once('dialog', dialog => dialog.accept());
    await page.locator('[data-testid="admin-document-delete-doc-1"]').click();
    await expect(page.getByText('아직 보관한 문서가 없습니다.')).toBeVisible();
  });

  test('모바일에서 긴 한글 파일명과 모든 관리 버튼이 가로 넘침 없이 보인다', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await seedAdminSession(page);
    await mockPrivateDocuments(page, {
      documents: [
        privateDocument({
          title: '김승찬 As-Is To-Be 경력 정리 최종본 2026년 9월',
          fileName: `${'길고긴개인문서원본파일명'.repeat(10)}.pdf`,
          description: '개인자료설명'.repeat(30),
        }),
      ],
    });
    await page.goto('/admin/documents');
    await expect(page.getByRole('heading', { name: '개인 문서함' })).toBeVisible();
    await expect(page.locator('[data-testid="admin-document-download-doc-1"]')).toBeVisible();
    await expect(page.locator('[data-testid="admin-documents-dropzone"]')).toBeVisible();
    const width = await page.evaluate(() => ({
      content: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    }));
    expect(width.content).toBeLessThanOrEqual(width.viewport);
    await page.locator('[data-testid="sidebar-toggle"]').click();
    await expect(page.locator('[data-testid="admin-documents-sidebar-link"]:visible')).toHaveAttribute(
      'href',
      '/admin/documents'
    );
  });
});
