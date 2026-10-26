import { expect, test } from '@playwright/test';
import { confirmPublication, isPublicationStub, openPublication, preparePublicationBrowser,
  RESTRICTED_CATEGORY, seedPublication } from './support/postPublication';

test.describe('발행 후 서버 fetch 캐시 갱신', () => {
  test.skip(!isPublicationStub, '로컬 서버와 스텁 API로만 검증한다.');
  test.beforeEach(async ({ page }) => { await preparePublicationBrowser(page); });

  test('캐시된 공개 본문도 수정하면 새 요청에 바로 반영된다', async ({ page, request }) => {
    const post = await seedPublication(request, { status: 'PUBLISHED', content: 'CACHE_OLD_' + Date.now() });
    const path = '/blog/' + post.category.slug + '/' + post.slug;
    expect(await (await request.get(path)).text()).toContain(post.content);
    await openPublication(page, post);
    await page.locator('.ProseMirror').fill('CACHE_NEW_' + post.id);
    await confirmPublication(page);
    const html = await (await request.get(path)).text();
    expect(html).toContain('CACHE_NEW_' + post.id);
    expect(html).not.toContain(post.content);
  });

  test('공개 예외를 승인 필요로 바꾸면 이전 공개 본문이 SSR에 남지 않는다', async ({ page, request }) => {
    const body = 'PRIVATE_BODY_' + Date.now();
    const post = await seedPublication(request, { status: 'PUBLISHED', categoryId: RESTRICTED_CATEGORY, publicOverride: true, content: body });
    const path = '/blog/' + post.category.slug + '/' + post.slug;
    expect(await (await request.get(path)).text()).toContain(body);
    await openPublication(page, post);
    await page.getByTestId('post-publication-restricted').check();
    await confirmPublication(page);
    const html = await (await request.get(path)).text();
    expect(html).not.toContain(body);
    expect(html).toContain('noindex');
  });

  test('발행 중단 후 새 비로그인 요청은 캐시된 글 대신 404를 받는다', async ({ page, request }) => {
    const post = await seedPublication(request, { status: 'PUBLISHED' });
    const path = '/blog/' + post.category.slug + '/' + post.slug;
    expect((await request.get(path)).status()).toBe(200);
    await openPublication(page, post);
    await page.getByTestId('post-publication-draft').check();
    await confirmPublication(page);
    expect((await request.get(path)).status()).toBe(404);
  });
});
