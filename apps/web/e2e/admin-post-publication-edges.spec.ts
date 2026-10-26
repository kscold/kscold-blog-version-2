import { expect, test } from '@playwright/test';
import { randomBytes } from 'node:crypto';
import { confirmPublication, isPublicationStub, openPublication, preparePublicationBrowser,
  publicationState, PUBLIC_CATEGORY, seedPublication, STUB } from './support/postPublication';
import { success } from './support/api';

test.describe('글 발행 입력과 저장 경계', () => {
  test.skip(!isPublicationStub, '로컬 스텁에서만 실행한다.');
  test.beforeEach(async ({ page }) => { await preparePublicationBrowser(page); });

  test('새 글은 영문 주소를 확인하고 한 번 생성한 뒤 기존 글로 계속 편집한다', async ({ page, request }) => {
    await page.goto('/admin/posts/new');
    const title = 'CI publish ' + randomBytes(5).toString('hex');
    const slug = title.toLowerCase().replaceAll(' ', '-');
    await page.getByTestId('post-editor-title').fill(title);
    await expect(page.getByTestId('post-editor-slug')).toHaveValue(slug);
    await page.locator('.ProseMirror').fill('새 글 생성 검증 본문');
    await page.getByTestId('post-editor-category').selectOption(PUBLIC_CATEGORY);
    await page.getByTestId('post-publication-public').check();
    await confirmPublication(page);
    const created = (await (await request.get(STUB + '/__publication?slug=' + slug)).json()).data.created;
    expect(created).toHaveLength(1);
    await page.getByRole('button', { name: '계속 편집' }).click();
    await expect(page).toHaveURL('/admin/posts/' + created[0].id + '/edit');
    await expect(page.getByTestId('post-editor-slug')).toHaveAttribute('readonly', '');
  });

  test('한글 새 글은 서버 초안 저장 전 주소를 요구한다', async ({ page }) => {
    await page.goto('/admin/posts/new');
    await page.getByTestId('post-editor-title').fill('한글 제목');
    await page.locator('.ProseMirror').fill('본문');
    await page.getByTestId('post-editor-category').selectOption(PUBLIC_CATEGORY);
    await page.getByTestId('post-editor-submit').click();
    await expect(page.getByTestId('post-editor-slug')).toHaveValue('');
    await expect(page.getByTestId('post-editor-slug')).toBeFocused();
    await expect(page.getByRole('alert').filter({ hasText: '영문 글 주소' }).first()).toBeVisible();
    await expect(page.getByTestId('post-save-result')).toHaveCount(0);
  });

  test('중복 주소는 전송 전에 거부하고 입력을 남긴다', async ({ page, request }) => {
    const taken = await seedPublication(request);
    const post = await seedPublication(request);
    await openPublication(page, post);
    await page.getByRole('button', { name: '주소 변경', exact: true }).click();
    await page.getByTestId('post-editor-slug').fill(taken.slug);
    await page.getByTestId('post-editor-submit').click();
    await expect(page.getByRole('alert').filter({ hasText: '이미 사용 중인 글 주소' }).first()).toBeVisible();
    await expect(page.getByTestId('post-editor-slug')).toHaveValue(taken.slug);
    expect((await publicationState(request, post.id)).writes).toHaveLength(0);
  });

  test('이전 주소 검사 응답이 늦게 와도 새 입력의 중복 결과를 덮지 않는다', async ({ page, request }) => {
    const post = await seedPublication(request);
    await openPublication(page, post);
    let releaseOld!: () => void;
    const oldReady = new Promise<void>(resolve => { releaseOld = resolve; });
    await page.route('**/api/posts/exists/slug/slow-old-address', async route => {
      await oldReady;
      await route.fulfill({ json: success(true) });
    });
    await page.getByRole('button', { name: '주소 변경', exact: true }).click();
    const started = page.waitForRequest('**/api/posts/exists/slug/slow-old-address');
    await page.getByTestId('post-editor-slug').fill('slow-old-address');
    await started;
    const nextSlug = post.slug + '-fresh';
    const nextChecked = page.waitForResponse('**/api/posts/exists/slug/' + nextSlug);
    await page.getByTestId('post-editor-slug').fill(nextSlug);
    await nextChecked;
    releaseOld();
    await expect(page.locator('#post-slug-error')).toHaveText('');
    await confirmPublication(page);
    expect((await publicationState(request, post.id)).post.slug).toBe(nextSlug);
  });

  test('카테고리 조회 실패를 공개 카테고리로 취급하거나 저장하지 않는다', async ({ page, request }) => {
    const post = await seedPublication(request, { status: 'PUBLISHED' });
    await page.route('**/api/categories', route => route.fulfill({ status: 503, json: { success: false } }));
    await page.goto('/admin/posts/' + post.id + '/edit');
    await expect(page.getByTestId('post-editor-title')).toHaveValue(post.title);
    await expect(page.getByTestId('post-planned-state')).toHaveText('상태 확인 필요');
    await page.getByTestId('post-editor-submit').click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect((await publicationState(request, post.id)).writes).toHaveLength(0);
  });

  test('보관 글과 추천 설정도 같은 발행 상태 표시를 사용한다', async ({ page, request }) => {
    const post = await seedPublication(request, { status: 'ARCHIVED', featured: true, publicOverride: true });
    await openPublication(page, post);
    await expect(page.getByTestId('post-current-state')).toHaveText('보관');
    await expect(page.getByTestId('post-planned-state')).toHaveText('보관');
    await page.getByTestId('post-editor-title').fill('보관 제목 변경');
    await confirmPublication(page);
    await expect(page.getByRole('link', { name: '관리자 미리보기' })).toHaveAttribute('href', '/admin/preview/' + post.slug);
    const state = await publicationState(request, post.id);
    expect(state.post.status).toBe('ARCHIVED');
    expect(state.post.publicOverride).toBe(true);
  });
});
