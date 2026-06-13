import { test, expect, type Page } from '@playwright/test';
import { success, mockApi } from './support/api';
import { seedAdminSession } from './support/auth';
import { expectNoHorizontalOverflow, VIEWPORTS } from './support/dom';

const CATEGORIES = success([
  { id: 'cat-1', name: 'Dev Story', slug: 'dev-story', depth: 0, icon: '✦', restricted: true },
  { id: 'cat-2', name: 'Frontend', slug: 'frontend', depth: 1, parent: 'cat-1', restricted: false },
]);

const TAGS = success([
  { id: 'tag-1', name: 'Next.js', slug: 'next-js', postCount: 4 },
  { id: 'tag-2', name: 'Tiptap', slug: 'tiptap', postCount: 2 },
]);

async function mockEditorApis(page: Page) {
  await mockApi(page, 'GET', '**/api/categories', CATEGORIES);
  await mockApi(page, 'GET', '**/api/tags', TAGS);
  await mockApi(page, 'GET', '**/api/feeds/tags', success([]));
}

test.describe('포스트 에디터 반응형 시나리오', () => {
  for (const viewport of VIEWPORTS) {
    test(`${viewport.label} 해상도에서도 노션형 포스트 에디터를 편하게 사용할 수 있다`, async ({
      page,
    }) => {
      await mockEditorApis(page);
      await seedAdminSession(page);
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/admin/posts/new');

      await expect(page.locator('[data-cy="post-editor-surface"]')).toBeVisible();
      await expect(page.locator('[data-cy="post-editor-cover"]')).toBeVisible();
      await expect(page.locator('[data-cy="post-editor-title"]')).toBeVisible();
      await expect(page.locator('[data-cy="post-editor-slug"]')).toBeVisible();
      await expect(page.locator('[data-cy="post-editor-document"]')).toBeVisible({ timeout: 20000 });
      await expect(page.locator('[data-cy="post-editor-toolbar"]')).toBeAttached({ timeout: 20000 });
      await expect(page.locator('[data-cy="post-editor-quick-actions"]')).toBeAttached({
        timeout: 20000,
      });

      await page.locator('[data-cy="post-editor-title"]').fill('노션형 작성기 테스트');
      await expect(page.locator('[data-cy="post-editor-category"]')).toBeVisible();
      await expect(page.locator('[data-cy="post-editor-public-override"]')).toBeVisible();
      await expect(page.locator('[data-cy="post-editor-submit"]')).toBeAttached();

      await expectNoHorizontalOverflow(page, viewport.width);
    });
  }

  test('제한 카테고리에서도 완전 공개 토글로 요청 없이 바로 공개할 수 있다', async ({ page }) => {
    await mockEditorApis(page);
    await seedAdminSession(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/admin/posts/new');

    await page.locator('[data-cy="post-editor-category"]').selectOption('cat-1');
    await expect(page.getByText('현재 제한 카테고리라서 기본적으로 열람 요청이 필요합니다.')).toBeVisible();
    await page.locator('[data-cy="post-editor-public-override"]').check({ force: true });
    await expect(
      page.getByText('현재 제한 카테고리지만, 이 글은 완전 공개로 우선 적용됩니다.')
    ).toBeVisible();
  });

  test('작성기는 코드 블록 언어를 지정하면 미리보기에서 올바르게 인식한다', async ({ page }) => {
    await mockEditorApis(page);
    await seedAdminSession(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/admin/posts/new');

    // window.prompt 로 코드 언어를 입력하는 흐름 → dialog 핸들러로 'ts' 응답
    page.on('dialog', dialog => dialog.accept('ts'));

    const editor = page.locator('.ProseMirror');
    await expect(editor).toBeVisible({ timeout: 20000 });
    await editor.click();
    await editor.pressSequentially('const total = 42;\nconsole.log(total);');

    await page.getByRole('button', { name: '코드', exact: true }).click();
    await page.getByRole('button', { name: '언어', exact: true }).click();
    await expect(page.getByRole('button', { name: 'TS', exact: true })).toBeVisible();

    await page.locator('[data-cy="post-editor-view-preview"]').click();
    const codeBlock = page.locator('[data-code-language="ts"]');
    await expect(codeBlock).toBeVisible({ timeout: 10000 });
    await expect(codeBlock).toContainText('TypeScript');
    await expect(page.getByText('const total = 42;')).toBeVisible();
  });

  test('작성기는 mermaid 코드 블록을 다이어그램으로 미리보기한다', async ({ page }) => {
    await mockEditorApis(page);
    await seedAdminSession(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/admin/posts/new');

    page.on('dialog', dialog => dialog.accept('mermaid'));

    const editor = page.locator('.ProseMirror');
    await expect(editor).toBeVisible({ timeout: 20000 });
    await editor.click();
    await editor.pressSequentially('graph TD; A[Login] --> B[Approved]; B --> C[Read Post]');

    await page.getByRole('button', { name: '코드', exact: true }).click();
    await page.getByRole('button', { name: '언어', exact: true }).click();
    await expect(page.getByRole('button', { name: 'MERMAID', exact: true })).toBeVisible();

    await page.locator('[data-cy="post-editor-view-preview"]').click();
    await expect(page.locator('[data-code-language="mermaid"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-mermaid-status="rendered"]')).toBeVisible({ timeout: 20000 });
    await expect(page.locator('.mermaid-diagram svg')).toBeVisible({ timeout: 20000 });
  });

  // 비디오 버튼이 'URL prompt 임베드' → 'mp4 파일 업로드'로 변경되어 원본 시나리오(YouTube URL 임베드)는
  // 더 이상 적용되지 않는다. 파일 업로드 기반 임베드는 별도 fixture 가 필요해 추후 보강한다.
  test.skip('작성기는 비디오 링크를 노션처럼 임베드 미리보기한다', async () => {});
});
