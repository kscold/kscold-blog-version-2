import { expect, test, type Page } from '@playwright/test';
import { mockShellApis, pageOf, success } from './support/api';
import { likeFeed } from './support/feed-like-fixture.mjs';
import { updateFeedReaction } from '../src/features/feed/api/useFeedLike';

async function setup(page: Page) {
  await mockShellApis(page);
  const state = { feed: { ...likeFeed }, requests: [] as boolean[], fail: false };
  await page.route(/\/api\/(feeds(?:\?.*)?|feeds\/ci-like-feed|users\/kscold\/feeds(?:\?.*)?)$/, async route => {
    const path = new URL(route.request().url()).pathname;
    await route.fulfill({ json: success(path.endsWith('/ci-like-feed') ? state.feed : pageOf([state.feed], 12)) });
  });
  await page.route('**/api/feeds/ci-like-feed/like', async route => {
    expect(route.request().method()).toBe('PUT');
    const { liked } = route.request().postDataJSON();
    state.requests.push(liked);
    state.feed = { ...state.feed, isLiked: liked, likesCount: liked ? 8 : 7 };
    await new Promise(resolve => setTimeout(resolve, 150));
    if (state.fail) { await route.abort(); return; }
    await route.fulfill({ json: success(state.feed) });
  });
  return state;
}

for (const path of ['/feed', '/feed/ci-like-feed', '/profile/kscold']) {
  test(`${path}: 서버가 확정한 개수로 표시하고 명시적 해제 요청을 보낸다`, async ({ page }) => {
    const state = await setup(page);
    await page.goto(path);
    const like = page.getByRole('button', { name: '좋아요 3개', exact: true });
    await expect(like).toBeEnabled();
    await like.click();
    const unlike = page.getByRole('button', { name: '좋아요 취소 8개', exact: true });
    await expect(unlike).toBeEnabled();
    await unlike.click();
    await expect(page.getByRole('button', { name: '좋아요 7개', exact: true })).toBeEnabled();
    expect(state.requests).toEqual([true, false]);
  });
}

test('같은 프레임의 연속 클릭도 요청은 한 번만 보낸다', async ({ page }) => {
  const state = await setup(page);
  await page.goto('/feed');
  const button = page.getByRole('button', { name: '좋아요 3개', exact: true });
  await expect(button).toBeEnabled();
  await button.evaluate(element => { (element as HTMLButtonElement).click(); (element as HTMLButtonElement).click(); });
  await expect(page.getByRole('button', { name: '좋아요 취소 8개', exact: true })).toBeEnabled();
  expect(state.requests).toEqual([true]);
});

test('서버 반영 후 응답이 끊겨도 재조회로 실제 상태를 복구하고 실패를 안내한다', async ({ page }) => {
  const state = await setup(page);
  state.fail = true;
  await page.goto('/feed');
  await page.getByRole('button', { name: '좋아요 3개', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: '좋아요 처리 결과' })).toBeVisible();
  await expect(page.getByRole('button', { name: '좋아요 취소 8개', exact: true })).toBeEnabled();
  expect(state.requests).toEqual([true]);
});

test('재조회된 좋아요 상태가 최초 렌더 상태에 묶이지 않는다', async ({ page }) => {
  const state = await setup(page);
  await page.goto('/feed/ci-like-feed');
  await expect(page.getByRole('button', { name: '좋아요 3개', exact: true })).toBeEnabled();
  state.feed = { ...state.feed, isLiked: true, likesCount: 15 };
  await page.evaluate(() => window.dispatchEvent(new Event('visibilitychange')));
  await expect(page.getByRole('button', { name: '좋아요 취소 15개', exact: true })).toBeEnabled();
});

test('로그인 전환 시 비회원 피드 캐시를 계정 상태로 재사용하지 않는다', async ({ page }) => {
  const state = await setup(page);
  const user = { id: 'like-user', username: 'like-user', displayName: '검증 사용자', email: 'like@example.com', role: 'USER' };
  await page.route('**/api/auth/login', async route => {
    state.feed = { ...state.feed, isLiked: true, likesCount: 9 };
    await route.fulfill({ json: success({ user }) });
  });
  await page.route('**/api/auth/me', route => route.fulfill({ json: success(user) }));
  await page.goto('/feed');
  await expect(page.getByRole('button', { name: '좋아요 3개', exact: true })).toBeEnabled();
  await page.getByRole('link', { name: 'LOGIN', exact: true }).click();
  await page.locator('[data-cy="login-email-input"]').fill(user.email);
  await page.locator('[data-cy="login-password-input"]').fill('test-password');
  await page.locator('[data-cy="login-submit"]').click();
  await expect(page).not.toHaveURL(/\/login/);
  await page.getByRole('link', { name: 'Feed', exact: true }).first().click();
  await expect(page.getByRole('button', { name: '좋아요 취소 9개', exact: true })).toBeEnabled();
  await page.route('**/api/auth/logout', async route => {
    state.feed = { ...state.feed, isLiked: false };
    await route.fulfill({ json: success(null) });
  });
  await page.getByRole('button', { name: 'Logout', exact: true }).click();
  await expect(page).toHaveURL(/\/login(?:\?|$)/);
  await expect(page.getByRole('link', { name: 'LOGIN', exact: true })).toBeVisible();
  await page.goto('/feed');
  await expect(page.getByRole('button', { name: '좋아요 9개', exact: true })).toBeEnabled();
});

test('프로필 요약 캐시에 본문을 주입하지 않고 좋아요 필드만 갱신한다', () => {
  const page = { content: [{ id: likeFeed.id, preview: { text: '요약' }, likesCount: 3, isLiked: false }], totalPages: 1 };
  const updated = updateFeedReaction(page, { ...likeFeed, likesCount: 8, isLiked: true });
  expect(updated).toEqual({ ...page, content: [{ ...page.content[0], likesCount: 8, isLiked: true }] });
  expect(page.content[0].likesCount).toBe(3);
});
