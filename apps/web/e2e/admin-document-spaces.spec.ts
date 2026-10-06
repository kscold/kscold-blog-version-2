import { test, expect } from '@playwright/test';
import { mockShellApis } from './support/api';
import { seedAdminSession } from './support/auth';
import { mockPrivateDocuments, privateDocument } from './support/adminDocuments';

const spaces = [
  { path: 'resumes', title: '이력서 관리', category: 'RESUME', documentTitle: '제출용 이력서' },
  { path: 'sources', title: '경력 소스 관리', category: 'CAREER', documentTitle: '실측 수치 원장' },
  { path: 'stories', title: '스토리 관리', category: 'STORY', documentTitle: '장애 대응 스토리' },
] as const;

test.beforeEach(async ({ page }) => {
  await mockShellApis(page);
  await seedAdminSession(page);
});

for (const space of spaces) {
  test(`${space.title}는 조회·검색·새 업로드의 분류를 고정한다`, async ({ page }) => {
    const listingCategories: (string | null)[] = [];
    const documents = spaces.map((entry, index) => privateDocument({
      id: `document-${index}`,
      title: entry.documentTitle,
      category: entry.category,
    }));
    await mockPrivateDocuments(page, {
      documents,
      onRequest: request => {
        if (request.method() === 'GET') {
          listingCategories.push(new URL(request.url()).searchParams.get('category'));
        }
      },
    });
    await page.goto(`/admin/documents/${space.path}`);
    await expect(page.getByRole('heading', { name: space.title, exact: true })).toBeVisible();
    await expect(page.locator('[data-testid="admin-documents-list"] article')).toHaveCount(1);
    await expect(page.locator('#document-filter-category')).toHaveValue(space.category);
    await expect(page.locator('#document-filter-category')).toBeDisabled();
    await expect(page.getByLabel('업로드할 문서의 분류')).toHaveValue(space.category);
    await expect(page.getByLabel('업로드할 문서의 분류')).toBeDisabled();
    await page.getByLabel('문서 검색').fill(space.documentTitle);
    await page.locator('[data-testid="admin-documents-search-submit"]').click();
    await expect(page.locator('[data-testid="admin-documents-list"]')).toContainText(space.documentTitle);
    await page.getByRole('button', { name: '검색 초기화' }).click();
    await page.locator('[data-testid="admin-documents-file-input"]').setInputFiles({
      name: `${space.path}.md`, mimeType: 'text/markdown', buffer: Buffer.from('# 개인 문서'),
    });
    await page.locator('[data-testid="admin-documents-upload-submit"]').click();
    await expect(page.locator('[data-testid="admin-documents-list"] article')).toHaveCount(2);
    expect(listingCategories.length).toBeGreaterThan(1);
    expect(listingCategories.every(category => category === space.category)).toBe(true);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });
}

test('전체 문서에서는 분류를 자유롭게 바꾸고 스토리 공간까지 모바일에서 이동한다', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockPrivateDocuments(page, {
    documents: spaces.map((space, index) => privateDocument({
      id: `document-${index}`, title: space.documentTitle, category: space.category,
    })),
  });
  await page.goto('/admin/documents');
  await expect(page.locator('[data-testid="admin-documents-list"] article')).toHaveCount(3);
  await expect(page.locator('#document-filter-category')).toBeEnabled();
  await expect(page.getByLabel('업로드할 문서의 분류')).toBeEnabled();
  await page.locator('#document-filter-category').selectOption('STORY');
  await expect(page.locator('[data-testid="admin-documents-list"] article')).toHaveCount(1);
  await expect(page.getByRole('navigation', { name: '문서 관리 공간' }).getByRole('link')).toHaveCount(4);
  await page.locator('[data-testid="admin-document-space-stories"]').click();
  await expect(page).toHaveURL(/\/admin\/documents\/stories$/);
  await expect(page.getByRole('heading', { name: '스토리 관리', exact: true })).toBeVisible();
  const widths = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: innerWidth }));
  expect(widths.content).toBeLessThanOrEqual(widths.viewport);
  await expect(page.locator('[data-testid="admin-document-space-stories"]')).toHaveAttribute('aria-current', 'page');
});

test('문서 분류를 바꾸면 이전 공간에서 사라지고 선택한 새 공간에서 관리한다', async ({ page }) => {
  await mockPrivateDocuments(page, { documents: [privateDocument()] });
  await page.goto('/admin/documents/resumes');
  await page.locator('[data-testid="admin-document-edit-doc-1"]').click();
  await page.locator('#document-edit-category').selectOption('CAREER');
  await page.locator('[data-testid="admin-document-edit-save"]').click();
  await expect(page.locator('[data-testid="admin-document-edit-form"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="admin-document-doc-1"]')).toHaveCount(0);
  await expect(page.getByText('다른 관리 공간으로 문서를 이동했습니다.')).toBeVisible();
  await page.locator('[data-testid="admin-document-space-sources"]').click();
  await expect(page.locator('[data-testid="admin-document-doc-1"]')).toBeVisible();
  await expect(page.locator('[data-testid="admin-document-doc-1"]')).toContainText('경력 소스');
  await page.locator('[data-testid="admin-document-edit-doc-1"]').click();
  await page.locator('#document-edit-category').selectOption('STORY');
  await page.locator('[data-testid="admin-document-edit-save"]').click();
  await expect(page.locator('[data-testid="admin-document-doc-1"]')).toHaveCount(0);
  await page.locator('[data-testid="admin-document-space-stories"]').click();
  await expect(page.locator('[data-testid="admin-document-doc-1"]')).toBeVisible();
});
