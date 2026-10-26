import { expect, test } from '@playwright/test';
import { randomBytes } from 'node:crypto';
import { createPostForm } from '../src/features/editor/lib/postForm';
import { expectNoHorizontalOverflow } from './support/dom';
import { createAdminAccessToken } from './support/auth';
import { confirmPublication, isPublicationStub, openPublication, preparePublicationBrowser, publicationState,
  PUBLIC_CATEGORY, RESTRICTED_CATEGORY, seedPublication, STUB } from './support/postPublication';

test.describe('관리자 글 발행 저장 흐름', () => {
  test.skip(!isPublicationStub, '운영에 쓰지 않고 로컬 스텁에서만 실행한다.');
  test.beforeEach(async ({ page }) => { await preparePublicationBrowser(page); });

  test('기존 영문 주소로 초안을 열어 발행해도 제목에서 주소를 다시 만들지 않는다', async ({ page, request }) => {
    const post = await seedPublication(request);
    await openPublication(page, post);
    await expect(page.getByTestId('post-editor-slug')).toHaveValue(post.slug);
    await expect(page.getByTestId('post-editor-slug')).toHaveAttribute('readonly', '');
    await page.getByTestId('post-editor-title').fill('새로운 한글 제목');
    await expect(page.getByTestId('post-autosave-status')).toContainText('이 브라우저에 임시 보관됨');
    await expect(page.getByTestId('post-editor-slug')).toHaveValue(post.slug);
    await page.getByTestId('post-publication-public').check();
    await expect(page.getByTestId('post-current-state')).toHaveText('초안');
    await confirmPublication(page);
    const state = await publicationState(request, post.id);
    expect(state.writes).toHaveLength(1);
    expect(state.writes[0]).not.toHaveProperty('slug');
    expect(state.post.slug).toBe(post.slug);
    await expect(page.getByRole('link', { name: '글 열어보기' })).toHaveAttribute('href', '/blog/' + post.category.slug + '/' + post.slug);
  });

  test('제한 발행은 태그와 무관하며 모든 태그를 제거한 결과도 저장한다', async ({ page, request }) => {
    const post = await seedPublication(request, { categoryId: RESTRICTED_CATEGORY });
    await openPublication(page, post);
    await page.getByRole('button', { name: '비공개 기존 태그 제거' }).click();
    await page.getByTestId('post-publication-restricted').check();
    await confirmPublication(page);
    const state = await publicationState(request, post.id);
    expect(state.writes[0].tagIds).toEqual([]);
    expect(state.post.restricted).toBe(true);
    await expect(page.getByTestId('post-save-result')).toContainText('발행 · 승인 필요');
    const html = await (await request.get('/blog/' + post.category.slug + '/' + post.slug)).text();
    expect(html).toContain('공개 요약');
    expect(html).not.toContain('임시 보관과 발행을 검증하는 본문입니다.');
    expect(html).toContain('noindex');
  });

  test('일반 카테고리의 승인 선택을 막고 카테고리 변경 후 범위를 다시 확인한다', async ({ page, request }) => {
    const post = await seedPublication(request, { status: 'PUBLISHED', publicOverride: false });
    await openPublication(page, post);
    await expect(page.getByTestId('post-publication-restricted')).toBeDisabled();
    await page.getByTestId('post-editor-category').selectOption(RESTRICTED_CATEGORY);
    await expect(page.getByTestId('post-planned-state')).toHaveText('공개 범위 재확인 필요');
    await page.getByTestId('post-editor-submit').click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect((await publicationState(request, post.id)).writes).toHaveLength(0);
    await page.getByTestId('post-publication-public').check();
    await confirmPublication(page);
    expect((await publicationState(request, post.id)).post.publicOverride).toBe(true);
  });

  test('생성 실패는 입력과 브라우저 임시 보관을 지우지 않는다', async ({ page, request }) => {
    const slug = 'ci-publish-fail-' + randomBytes(5).toString('hex');
    const form = { ...createPostForm(), title: '[저장 실패] 한글 글', slug, content: '보존할 본문', categoryId: PUBLIC_CATEGORY };
    await page.addInitScript(value => localStorage.setItem('autosave-new-post', JSON.stringify({ version: 2, form: value, savedAt: new Date().toISOString() })), form);
    await page.goto('/admin/posts/new');
    await page.getByRole('button', { name: '작성 내용 복구' }).click();
    await expect(page.getByTestId('post-editor-title')).toHaveValue(form.title);
    await page.getByTestId('post-editor-submit').click();
    await expect(page.getByRole('alert').filter({ hasText: '글을 저장하지 못했습니다' })).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('autosave-new-post'))).toContain('보존할 본문');
    await expect(page.getByTestId('post-save-result')).toHaveCount(0);
    const data = await (await request.get(STUB + '/__publication?slug=' + slug)).json();
    expect(data.data.created).toHaveLength(0);
  });

  test('기존 글 복구는 작성 내용만 가져오고 주소·공개 범위는 서버 값을 유지한다', async ({ page, request }) => {
    const post = await seedPublication(request);
    const saved = { ...createPostForm(post), title: '복구할 제목', slug: '오래된-주소', status: 'PUBLISHED', publicOverride: true };
    await page.addInitScript(({ id, form }) => localStorage.setItem('autosave-post-' + id, JSON.stringify({ form, savedAt: '2026-01-01T00:00:00Z' })), { id: post.id, form: saved });
    await openPublication(page, post);
    await page.getByRole('button', { name: '작성 내용 복구' }).click();
    await expect(page.getByTestId('post-editor-title')).toHaveValue('복구할 제목');
    await expect(page.getByTestId('post-editor-slug')).toHaveValue(post.slug);
    await expect(page.getByTestId('post-planned-state')).toHaveText('초안');
  });

  test('직접 주소를 바꿀 때만 확인하며 취소와 중복 저장을 막는다', async ({ page, request }) => {
    const post = await seedPublication(request, { status: 'PUBLISHED' });
    await openPublication(page, post);
    await page.getByRole('button', { name: '주소 변경', exact: true }).click();
    await page.getByTestId('post-editor-slug').fill(post.slug + '-renamed');
    await page.getByTestId('post-editor-submit').click();
    await expect(page.getByRole('dialog')).toContainText('이전 주소');
    await page.getByRole('button', { name: '돌아가서 편집' }).click();
    await expect(page.getByTestId('post-editor-submit')).toBeFocused();
    expect((await publicationState(request, post.id)).writes).toHaveLength(0);
    await page.getByTestId('post-editor-submit').click();
    await page.getByTestId('post-confirm-save').evaluate(button => { (button as HTMLButtonElement).click(); (button as HTMLButtonElement).click(); });
    await expect(page.getByTestId('post-save-result')).toBeVisible();
    await expect(page.getByTestId('post-save-result').getByRole('heading', { level: 1 })).toBeFocused();
    const state = await publicationState(request, post.id);
    expect(state.writes).toHaveLength(1);
    expect(state.writes[0].slug).toBe(post.slug + '-renamed');
  });

  test('기존 한글 주소도 제목 수정 때문에 영문화하거나 저장을 막지 않는다', async ({ page, request }) => {
    const post = await seedPublication(request, { slug: '기존-한글-' + randomBytes(4).toString('hex') });
    await openPublication(page, post);
    await page.getByTestId('post-editor-title').fill('변경된 제목');
    await page.getByTestId('post-editor-submit').click();
    await expect(page.getByTestId('post-save-result')).toBeVisible();
    expect((await publicationState(request, post.id)).post.slug).toBe(post.slug);
  });

  test('관리자로 검증되지 않은 쿠키는 서버 저장을 허용하지 않는다', async ({ page, request }) => {
    const post = await seedPublication(request);
    await openPublication(page, post);
    await page.context().addCookies([{ name: 'auth-token', value: createAdminAccessToken(), url: 'http://127.0.0.1:3101' }]);
    await page.getByTestId('post-editor-submit').click();
    await expect(page.getByRole('alert').filter({ hasText: '관리자 로그인' })).toBeVisible();
    expect((await publicationState(request, post.id)).writes).toHaveLength(0);
  });

  for (const width of [1440, 390]) {
    test(width + ' 화면에서 상태·주소·발행 확인을 읽고 조작할 수 있다', async ({ page, request }) => {
      const post = await seedPublication(request);
      await page.setViewportSize({ width, height: 900 });
      await openPublication(page, post);
      await expectNoHorizontalOverflow(page, width);
      await page.getByTestId('post-publication-public').check();
      await page.screenshot({ path: 'test-results/screenshots/admin-post-publish-' + width + '.png', fullPage: true });
      await page.getByTestId('post-editor-submit').click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.screenshot({ path: 'test-results/screenshots/admin-post-confirm-' + width + '.png' });
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(page.getByTestId('post-editor-submit')).toBeFocused();
    });
  }
});
