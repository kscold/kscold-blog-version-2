import { expect, test } from '@playwright/test';
import { mockShellApis } from './support/api';
import { seedAdminSession } from './support/auth';
import { mockPrivateDocuments, privateDocument } from './support/adminDocuments';
import { createKoreanPrivatePdf, createPrivatePdf, mockPrivatePdf, PRIVATE_PDF_TEXT } from './support/privatePdf';

test.use({ navigationTimeout: 30_000 });
test.setTimeout(60_000);

test.describe('개인 문서 PDF 바로 보기', () => {
  test.beforeEach(async ({ page }) => {
    await mockShellApis(page);
    await seedAdminSession(page);
  });

  test('목록에서 PDF만 바로 보기 링크를 제공하고 다른 파일은 다운로드를 유지한다', async ({ page }) => {
    await mockPrivateDocuments(page, {
      documents: [
        privateDocument(),
        privateDocument({ id: 'doc-html', fileName: 'career.html', contentType: 'text/html' }),
        privateDocument({ id: 'doc-md', fileName: 'career.md', contentType: 'text/markdown' }),
      ],
    });
    await page.goto('/admin/documents');
    await expect(page.locator('[data-cy="admin-document-preview-doc-1"]')).toHaveAttribute(
      'href', '/admin/documents/doc-1/view'
    );
    await expect(page.locator('[data-cy="admin-document-preview-doc-1"]')).toHaveText(/바로 보기/);
    await expect(page.locator('[data-cy="admin-document-preview-doc-html"]')).toHaveCount(0);
    await expect(page.locator('[data-cy="admin-document-preview-doc-md"]')).toHaveCount(0);
    await expect(page.locator('[data-cy="admin-document-download-doc-html"]')).toBeVisible();
  });

  test('실제 PDF를 캔버스와 선택 가능한 텍스트로 읽고 페이지 사이를 이동한다', async ({ page }) => {
    await mockPrivatePdf(page);
    await page.goto('/admin/documents/doc-1/view');
    const viewer = page.locator('[data-cy="admin-document-viewer"]');
    await expect(viewer).toBeVisible();
    const first = page.locator('[data-cy="pdf-page-1"]');
    await expect(first.locator('canvas')).toBeVisible();
    await expect(first).toContainText(`${PRIVATE_PDF_TEXT} page 1`);
    const dimensions = await first.locator('canvas').evaluate(canvas => ({
      width: (canvas as HTMLCanvasElement).width,
      height: (canvas as HTMLCanvasElement).height,
    }));
    expect(dimensions.width).toBeGreaterThan(0);
    expect(dimensions.height).toBeGreaterThan(0);
    const selectedText = await first.locator('.react-pdf__Page__textContent').evaluate(layer => {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(layer);
      selection?.removeAllRanges();
      selection?.addRange(range);
      return selection?.toString();
    });
    expect(selectedText).toContain(`${PRIVATE_PDF_TEXT} page 1`);
    await expect(page.getByRole('button', { name: 'KSCOLD 대화 열기', exact: true })).toHaveCount(0);
    await expect(page.getByTestId('custom-cursor')).toHaveCount(0);
    await expect(page.locator('aside')).toHaveCount(0);
    expect(await page.evaluate(() =>
      document.body.classList.contains('custom-cursor-active') ||
      getComputedStyle(document.body).cursor === 'none'
    )).toBe(false);
    await page.locator('[data-cy="pdf-viewer-next"]').click();
    await expect(page.locator('[data-cy="pdf-viewer-page-input"]')).toHaveValue('2');
    await expect(page.locator('[data-cy="pdf-page-2"] canvas')).toBeVisible();
    await page.locator('[data-cy="pdf-viewer-previous"]').click();
    await expect(page.locator('[data-cy="pdf-viewer-page-input"]')).toHaveValue('1');
    const input = page.getByRole('spinbutton', { name: 'PDF 페이지 번호' });
    await input.fill('3');
    await input.press('Enter');
    await expect(page.locator('[data-cy="pdf-page-3"]')).toContainText(`${PRIVATE_PDF_TEXT} page 3`);
    await expect(page.locator('[data-cy="pdf-page-3"] canvas')).toBeInViewport();
    await expect(page.locator('[data-cy="pdf-viewer-next"]')).toBeDisabled();
    await expect(page.locator('iframe, object, embed')).toHaveCount(0);
  });

  test('시스템 글꼴로 인쇄한 한글 경력 샘플 PDF를 텍스트와 캔버스로 읽는다', async ({ page }) => {
    const buffer = await createKoreanPrivatePdf(page);
    await mockPrivatePdf(page, { buffer });
    await page.goto('/admin/documents/doc-1/view');
    const first = page.locator('[data-cy="pdf-page-1"]');
    await expect(first.locator('canvas')).toBeVisible();
    await expect(first.locator('.react-pdf__Page__textContent')).toContainText('김승찬 경력 문서');
    await expect(first).toContainText('실측 근거');
    await expect(first).toContainText('LangGraph');
    await expect(first).toContainText('실제 경력 수치나 개인 이력서 원문이 없습니다.');
    expect(page.context().pages()).toHaveLength(1);
  });

  test('뷰어에서 원본을 다운로드하고 이력서 관리로 돌아간다', async ({ page }) => {
    await mockPrivatePdf(page);
    await page.goto('/admin/documents/doc-1/view');
    await expect(page.locator('[data-cy="pdf-page-1"] canvas')).toBeVisible();
    const downloaded = page.waitForEvent('download');
    await page.locator('[data-cy="admin-document-viewer"]').getByRole('link', { name: '다운로드', exact: true }).click();
    expect((await downloaded).suggestedFilename()).toBe('private-viewer-test.pdf');
    await expect(page.locator('[data-cy="pdf-viewer-back"]')).toHaveAttribute(
      'href', '/admin/documents/resumes'
    );
    await page.getByRole('link', { name: '이력서 관리로 돌아가기', exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/documents\/resumes$/);
    await expect(page.locator('[data-cy="admin-document-doc-1"]')).toBeVisible();
    await expect(page.locator('[data-cy="admin-document-viewer"]')).toHaveCount(0);
  });

  for (const { category, path, title } of [
    { category: 'CAREER', path: 'sources', title: '경력 소스 관리' },
    { category: 'STORY', path: 'stories', title: '스토리 관리' },
    { category: 'PERSONAL', path: '', title: '개인 문서함' },
  ] as const) {
    test(`${title} 분류의 PDF는 해당 관리 공간으로 돌아간다`, async ({ page }) => {
      await mockPrivatePdf(page, { document: { category } });
      await page.goto('/admin/documents/doc-1/view');
      await expect(page.locator('[data-cy="pdf-page-1"] canvas')).toBeVisible();
      const href = `/admin/documents${path ? `/${path}` : ''}`;
      const back = page.getByRole('link', { name: `${title}로 돌아가기`, exact: true });
      await expect(back).toHaveAttribute('href', href);
      await back.click();
      await expect(page).toHaveURL(new URL(href, process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3101').href);
      await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
      await expect(page.locator('[data-cy="admin-document-doc-1"]')).toBeVisible();
    });
  }

  test('확대·축소·화면 맞춤·회전을 실제 렌더링에 반영한다', async ({ page }) => {
    await mockPrivatePdf(page);
    await page.goto('/admin/documents/doc-1/view');
    const canvas = page.locator('[data-cy="pdf-page-1"] canvas');
    await expect(canvas).toBeVisible();
    const original = await canvas.evaluate(element => (element as HTMLCanvasElement).width);
    await page.getByRole('button', { name: 'PDF 확대', exact: true }).click();
    await expect.poll(() => canvas.evaluate(element => (element as HTMLCanvasElement).width)).toBeGreaterThan(original);
    await page.getByRole('button', { name: 'PDF 축소', exact: true }).click();
    await expect.poll(() => canvas.evaluate(element => (element as HTMLCanvasElement).width)).toBeLessThanOrEqual(original);
    await page.locator('[data-cy="pdf-viewer-fit"]').click();
    const scroll = page.locator('[data-cy="pdf-viewer-scroll"]');
    await expect(scroll).toHaveAttribute('data-rotation', '0');
    await page.locator('[data-cy="pdf-viewer-rotate"]').click();
    await expect(scroll).toHaveAttribute('data-rotation', '90');
    await expect.poll(() => canvas.evaluate(element => {
      const current = element as HTMLCanvasElement;
      return current.width > current.height;
    })).toBe(true);
  });

  test('49페이지 문서는 가까운 페이지만 렌더링하며 먼 페이지로 바로 이동한다', async ({ page }) => {
    await mockPrivatePdf(page, { pageCount: 49 });
    await page.goto('/admin/documents/doc-1/view');
    const viewer = page.locator('[data-cy="admin-document-viewer"]');
    await expect(page.locator('[data-cy="pdf-page-1"] canvas')).toBeVisible();
    await expect.poll(() => viewer.locator('canvas').count()).toBeLessThanOrEqual(8);
    await page.locator('[data-cy="pdf-viewer-page-input"]').fill('49');
    await page.locator('[data-cy="pdf-viewer-page-input"]').press('Enter');
    await expect(page.locator('[data-cy="pdf-page-49"] canvas')).toBeInViewport();
    await expect(page.locator('[data-cy="pdf-page-49"]')).toContainText(`${PRIVATE_PDF_TEXT} page 49`);
    await expect.poll(() => viewer.locator('canvas').count()).toBeLessThanOrEqual(8);
    await expect(page.locator('[data-cy="pdf-viewer-next"]')).toBeDisabled();
  });

  test('암호화 PDF는 잘못된 암호를 안전하게 거절하고 올바른 암호로 열 수 있다', async ({ page }) => {
    await mockPrivatePdf(page, { buffer: createPrivatePdf(3, 'viewer-test-only') });
    await page.goto('/admin/documents/doc-1/view');
    const password = page.locator('[data-cy="pdf-viewer-password"]');
    await expect(password).toBeVisible();
    await expect(page.locator('[data-cy="admin-document-viewer"] canvas')).toHaveCount(0);
    await password.fill('incorrect-test-password');
    await page.locator('[data-cy="pdf-viewer-password-submit"]').click();
    await expect(page.getByText(/암호가 (올바르지|맞지)|잘못된 암호/)).toBeVisible();
    await password.fill('viewer-test-only');
    await page.locator('[data-cy="pdf-viewer-password-submit"]').click();
    await expect(page.locator('[data-cy="pdf-page-1"] canvas')).toBeVisible();
    await expect(page.locator('[data-cy="pdf-page-1"]')).toContainText(PRIVATE_PDF_TEXT);
    const persisted = await page.evaluate(() => Object.values(localStorage).join('\n'));
    expect(persisted).not.toContain('viewer-test-only');
  });
});
