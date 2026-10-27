import { test, expect, type Page } from '@playwright/test';
import path from 'node:path';
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
  for (const stored of ['{"form":', '{"version":999}']) {
    test(`손상된 임시 보관을 안내하고 새 글 작성을 유지한다: ${stored}`, async ({ page }) => {
      await mockEditorApis(page);
      await seedAdminSession(page);
      await page.addInitScript(value => localStorage.setItem('autosave-new-post', value), stored);
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto('/admin/posts/new');
      await expect(page.getByTestId('post-autosave-status')).toContainText('임시 보관을 읽을 수 없습니다');
      await page.getByTestId('post-editor-title').fill('계속 작성할 새 글');
      await expect(page.getByTestId('post-editor-title')).toHaveValue('계속 작성할 새 글');
      await expect(page.locator('.ProseMirror')).toBeVisible();
      expect(errors).toEqual([]);
    });
  }

  for (const viewport of VIEWPORTS) {
    test(`${viewport.label} 해상도에서도 노션형 포스트 에디터를 편하게 사용할 수 있다`, async ({
      page,
    }) => {
      await mockEditorApis(page);
      await seedAdminSession(page);
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/admin/posts/new');

      await expect(page.locator('[data-testid="post-editor-surface"]')).toHaveCount(1);
      await expect(page.locator('[data-testid="post-editor-surface"]')).toBeVisible();
      await expect(page.locator('[data-testid="post-editor-cover"]')).toBeVisible();
      await expect(page.locator('[data-testid="post-editor-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="post-editor-slug"]')).toBeVisible();
      await expect(page.locator('[data-testid="post-editor-document"]')).toBeVisible({ timeout: 20000 });
      await expect(page.locator('[data-testid="post-editor-toolbar"]')).toBeAttached({ timeout: 20000 });
      await expect(page.locator('[data-testid="post-editor-quick-actions"]')).toBeAttached({
        timeout: 20000,
      });

      await page.locator('[data-testid="post-editor-title"]').fill('노션형 작성기 테스트');
      await expect(page.locator('[data-testid="post-editor-category"]')).toBeVisible();
      await expect(page.getByTestId('post-publication-public')).toBeVisible();
      await expect(page.locator('[data-testid="post-editor-submit"]')).toBeAttached();

      await expectNoHorizontalOverflow(page, viewport.width);
    });
  }

  test('제한 카테고리에서도 저장 후 상태를 누구나로 선택할 수 있다', async ({ page }) => {
    await mockEditorApis(page);
    await seedAdminSession(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/admin/posts/new');

    await expect(page.locator('[data-testid="post-editor-surface"]')).toHaveCount(1);
    await page.locator('[data-testid="post-editor-category"]').selectOption('cat-1');
    await expect(page.getByTestId('post-planned-state')).toHaveText('초안');
    await page.getByTestId('post-publication-public').check();
    await expect(page.getByTestId('post-planned-state')).toHaveText('발행 · 누구나');
    await expect(page.getByTestId('post-current-state')).toHaveText('아직 서버에 저장하지 않음');
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

    await page.locator('[data-testid="post-editor-view-preview"]').click();
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

    await page.locator('[data-testid="post-editor-view-preview"]').click();
    await expect(page.locator('[data-code-language="mermaid"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-mermaid-status="rendered"]')).toBeVisible({ timeout: 20000 });
    await expect(page.locator('.mermaid-diagram svg')).toBeVisible({ timeout: 20000 });
  });

  for (const diagram of [
    {
      name: '흐름도',
      chart: String.raw`flowchart LR; A["$$x^2 + y^2 = z^2$$"] --> B["$$\frac{1}{2}$$"]`,
      formulas: 2,
    },
    {
      name: '시퀀스',
      chart: String.raw`sequenceDiagram
        Alice->>Bob: $$\sqrt{x^2}$$`,
      formulas: 1,
    },
  ]) {
    test(`작성기는 Mermaid ${diagram.name} 안의 수식을 MathML로 렌더링한다`, async ({ page }) => {
      await mockEditorApis(page);
      await seedAdminSession(page);
      await page.goto('/admin/posts/new');
      page.on('dialog', dialog => dialog.accept('mermaid'));
      const editor = page.locator('.ProseMirror');
      await expect(editor).toBeVisible();
      await editor.click();
      await page.getByRole('button', { name: '코드', exact: true }).click();
      await page.getByRole('button', { name: '언어', exact: true }).click();
      await editor.locator('pre').click();
      await page.keyboard.insertText(diagram.chart);
      await page.getByTestId('post-editor-view-preview').click();

      const rendered = page.locator('[data-mermaid-status="rendered"]');
      await expect(rendered).toBeVisible({ timeout: 20000 });
      await expect(rendered.locator('svg math')).toHaveCount(diagram.formulas);
      await expect(rendered.locator('svg math').first()).toBeVisible();
      await expect(rendered.locator('.katex-error')).toHaveCount(0);
    });
  }

  test('작성기는 동영상 파일을 업로드하고 편집·미리보기에서 재생 가능한 영상을 유지한다', async ({ page, baseURL }) => {
    await mockEditorApis(page);
    await seedAdminSession(page);
    const fixture = path.resolve('e2e/fixtures/editor-video.webm');
    const videoUrl = new URL('/e2e/editor-video.webm', baseURL).href;
    await mockApi(page, 'POST', '**/api/media/upload', success({ url: videoUrl }));
    await page.route(videoUrl, route => route.fulfill({ path: fixture, contentType: 'video/webm' }));
    await page.goto('/admin/posts/new');
    await expect(page.locator('.ProseMirror')).toBeVisible();
    const chooser = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: '동영상', exact: true }).click();
    const uploaded = page.waitForRequest(request => request.method() === 'POST' && new URL(request.url()).pathname === '/api/media/upload');
    await (await chooser).setFiles(fixture);
    const request = await uploaded;
    expect(request.headers()['content-type']).toContain('multipart/form-data');
    expect(request.postDataBuffer()?.includes(Buffer.from('editor-video.webm'))).toBe(true);

    const editorVideo = page.locator('.ProseMirror video');
    await expect(editorVideo).toHaveAttribute('src', videoUrl);
    await expect.poll(() => editorVideo.evaluate((video: HTMLVideoElement) => video.videoWidth)).toBeGreaterThan(0);
    await page.getByTestId('post-editor-view-preview').click();
    const previewVideo = page.locator('video');
    await expect(previewVideo).toHaveCount(1);
    await expect(previewVideo).toHaveAttribute('src', videoUrl);
    await expect.poll(() => previewVideo.evaluate((video: HTMLVideoElement) => video.videoWidth)).toBeGreaterThan(0);
    expect(await previewVideo.evaluate((video: HTMLVideoElement) => video.error)).toBeNull();
  });
});
