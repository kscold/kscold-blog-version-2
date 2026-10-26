import { expect, type APIRequestContext, type Page } from '@playwright/test';
import type { Post } from '../../src/shared/model/types/blog';
import { isolateBackendApi } from './api';
import { seedAdminSession, createVerifiedAdminAccessToken } from './auth';

export const PUBLIC_CATEGORY = 'aaaaaaaaaaaaaaaaaaaaaaaa';
export const RESTRICTED_CATEGORY = 'bbbbbbbbbbbbbbbbbbbbbbbb';
export const STUB = 'http://127.0.0.1:4100';
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3101';
export const isPublicationStub = baseURL === 'http://127.0.0.1:3101';

export async function seedPublication(request: APIRequestContext, input: Record<string, unknown> = {}): Promise<Post> {
  if (!isPublicationStub) throw new Error('글 발행 검사는 로컬 스텁에서만 실행합니다.');
  const response = await request.post(STUB + '/__publication', { data: input });
  expect(response.ok()).toBeTruthy();
  return (await response.json()).data;
}

export async function publicationState(request: APIRequestContext, id: string) {
  return (await (await request.get(STUB + '/__publication?id=' + id)).json()).data as {
    post: Post; writes: Record<string, unknown>[];
  };
}

export async function preparePublicationBrowser(page: Page) {
  if (!isPublicationStub) throw new Error('운영 사이트에서는 실행하지 않습니다.');
  await isolateBackendApi(page);
  await page.route(/\/api\/(?:posts(?:\/[^?]*)?|categories|tags)(?:\?|$)/, async route => {
    if (route.request().method() === 'GET') await route.continue();
    else await route.abort();
  });
  await seedAdminSession(page);
  await page.context().addCookies([{ name: 'auth-token', value: createVerifiedAdminAccessToken(), url: baseURL }]);
}

export async function openPublication(page: Page, post: Post) {
  await page.goto('/admin/posts/' + post.id + '/edit');
  await expect(page.getByTestId('post-editor-title')).toHaveValue(post.title);
  await expect(page.getByTestId('post-editor-category')).toHaveValue(post.category.id);
  await expect(page.locator('.ProseMirror')).toBeVisible();
}

export async function confirmPublication(page: Page) {
  await page.getByTestId('post-editor-submit').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByTestId('post-confirm-save').click();
  await expect(page.getByTestId('post-save-result')).toBeVisible();
}
