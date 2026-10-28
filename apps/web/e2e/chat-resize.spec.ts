import { expect, test, type Locator, type Page } from '@playwright/test';
import { prepareAgentChat } from './support/agent-chat';

async function openChat(page: Page) {
  await prepareAgentChat(page);
  await page.goto('/?chat=open');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('tab')).toHaveCount(2);
  await expect(dialog).toHaveCSS('transform', 'none');
  return dialog;
}

async function bounds(dialog: Locator) {
  const box = await dialog.boundingBox();
  if (!box) throw new Error('채팅 창을 찾지 못했습니다.');
  return box;
}

async function dragHandle(page: Page, handle: Locator, delta: { x: number; y: number }) {
  const box = await bounds(handle);
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + delta.x, y + delta.y, { steps: 8 });
  await page.mouse.up();
}

test('두 대화 탭과 왼쪽 위 크기 조절, 저장 및 기본 크기 복원', async ({ page }, testInfo) => {
  const dialog = await openChat(page);
  await expect.poll(async () => Math.round((await bounds(dialog)).height)).toBe(720);
  const original = await bounds(dialog);
  expect(original.width).toBe(440);
  await expect(dialog.getByRole('tab', { name: '피드 초안' })).toHaveCount(0);
  const agentTab = dialog.getByRole('tab', { name: 'Agent에게 묻기' });
  await agentTab.focus();
  await agentTab.press('ArrowRight');
  await expect(dialog.getByRole('tab', { name: '주인에게 남기기' })).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(agentTab).toBeFocused();
  await page.screenshot({ path: testInfo.outputPath('chat-desktop-default-1440.png') });

  await dragHandle(page, dialog.getByRole('button', { name: '채팅 너비와 높이 조절', exact: true }), { x: -240, y: -80 });
  const enlarged = await bounds(dialog);
  expect(enlarged.width).toBeCloseTo(680, 0);
  expect(enlarged.height).toBeCloseTo(800, 0);
  expect(enlarged.x + enlarged.width).toBeCloseTo(original.x + original.width, 0);
  expect(enlarged.y + enlarged.height).toBeCloseTo(original.y + original.height, 0);
  await expect(dialog.getByRole('textbox')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('chat-desktop-resized-1440.png') });

  await page.reload();
  await expect.poll(async () => Math.round((await bounds(page.getByRole('dialog'))).width)).toBe(680);
  await page.getByRole('button', { name: '채팅 기본 크기로 복원' }).click();
  await expect.poll(async () => Math.round((await bounds(dialog)).width)).toBe(440);
  await expect.poll(async () => Math.round((await bounds(dialog)).height)).toBe(720);
});

test('위쪽과 왼쪽 가장자리, 키보드 및 화면 경계를 지킨다', async ({ page }) => {
  const dialog = await openChat(page);
  const left = dialog.getByRole('button', { name: '채팅 너비 조절', exact: true });
  const top = dialog.getByRole('button', { name: '채팅 높이 조절', exact: true });
  await dragHandle(page, left, { x: -100, y: 0 });
  await expect.poll(async () => Math.round((await bounds(dialog)).width)).toBe(540);
  await dragHandle(page, top, { x: 0, y: 80 });
  await expect.poll(async () => Math.round((await bounds(dialog)).height)).toBe(640);
  await left.press('ArrowLeft');
  await expect.poll(async () => Math.round((await bounds(dialog)).width)).toBe(556);
  await top.press('Shift+ArrowDown');
  await expect.poll(async () => Math.round((await bounds(dialog)).height)).toBe(592);
  await top.press('Home');
  await expect.poll(async () => Math.round((await bounds(dialog)).height)).toBe(720);
  await dragHandle(page, left, { x: 700, y: 0 });
  await expect.poll(async () => Math.round((await bounds(dialog)).width)).toBe(360);
  await dragHandle(page, top, { x: 0, y: 600 });
  await expect.poll(async () => Math.round((await bounds(dialog)).height)).toBe(420);
  // 스크롤바 예약 공간처럼 오른쪽 기준점이 달라도 왼쪽 여백을 유지해야 한다.
  await dialog.evaluate(element => { element.style.right = '22px'; });
  await dragHandle(page, dialog.getByRole('button', { name: '채팅 너비와 높이 조절' }), { x: -2000, y: -2000 });
  expect((await bounds(dialog)).x).toBeGreaterThanOrEqual(15);
  expect((await bounds(dialog)).y).toBeGreaterThanOrEqual(7);
  await page.setViewportSize({ width: 800, height: 600 });
  await expect.poll(async () => (await bounds(dialog)).width).toBeLessThanOrEqual(768);
  expect((await bounds(dialog)).y).toBeGreaterThanOrEqual(7);
  await top.dblclick();
  await expect.poll(async () => Math.round((await bounds(dialog)).width)).toBe(440);
});

test('차단되거나 잘못된 저장소에서도 크기를 조절한다', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('kscold-chat-size', '{"width":"bad","height":-10}'));
  const dialog = await openChat(page);
  await expect.poll(async () => Math.round((await bounds(dialog)).width)).toBe(440);
  await page.evaluate(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } });
  });
  await dialog.getByRole('button', { name: '채팅 너비 조절', exact: true }).press('ArrowLeft');
  await expect.poll(async () => Math.round((await bounds(dialog)).width)).toBe(456);
  await dialog.getByRole('button', { name: '채팅 기본 크기로 복원' }).click();
  await expect.poll(async () => Math.round((await bounds(dialog)).width)).toBe(440);
});

test('모바일은 저장된 크기와 무관하게 전체 화면으로 열고 조절 손잡이를 숨긴다', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => localStorage.setItem('kscold-chat-size', '{"width":1000,"height":900}'));
  const dialog = await openChat(page);
  await expect(dialog.getByRole('button', { name: /채팅.*조절/ })).toHaveCount(0);
  await expect(dialog.getByRole('button', { name: '채팅 기본 크기로 복원' })).toHaveCount(0);
  const box = await bounds(dialog);
  expect(box.width).toBeLessThanOrEqual(390);
  expect(box.height).toBeGreaterThan(800);
  await expect(dialog.getByRole('textbox')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('chat-mobile-390.png') });
});

test('최대화하면 헤더 아래와 사이드바 오른쪽 본문 영역을 가득 채우고 다시 원래 크기로 돌아온다', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const dialog = await openChat(page);
  await dragHandle(page, dialog.getByRole('button', { name: '채팅 너비 조절', exact: true }), { x: -100, y: 0 });
  await expect.poll(async () => Math.round((await bounds(dialog)).width)).toBe(540);

  await dialog.getByRole('button', { name: '채팅 창 최대화' }).click();
  const header = await page.locator('[data-chat-maximize-top]').boundingBox();
  const sidebar = await page.locator('[data-chat-maximize-left]').boundingBox();
  if (!header || !sidebar) throw new Error('헤더나 사이드바를 찾지 못했습니다.');
  await expect.poll(async () => Math.round((await bounds(dialog)).x)).toBe(Math.round(sidebar.x + sidebar.width + 16));
  const box = await bounds(dialog);
  // 고정 위치의 기준은 스크롤바를 뺀 화면이므로 운영체제마다 다른 스크롤바 폭을 제외하고 비교한다.
  const viewport = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  }));
  expect(box.y).toBeCloseTo(header.y + header.height + 8, 0);
  expect(box.x + box.width).toBeCloseTo(viewport.width - 16, 0);
  expect(box.y + box.height).toBeCloseTo(viewport.height - 16, 0);
  await expect(dialog.getByRole('button', { name: /채팅.*조절/ })).toHaveCount(0);
  await expect(dialog.getByRole('textbox')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('chat-desktop-maximized-1440.png') });

  await page.reload();
  await expect.poll(async () => Math.round((await bounds(page.getByRole('dialog'))).x)).toBe(Math.round(sidebar.x + sidebar.width + 16));
  await page.getByRole('button', { name: '채팅 창 원래 크기로' }).click();
  await expect.poll(async () => Math.round((await bounds(dialog)).width)).toBe(540);
  await expect.poll(async () => Math.round((await bounds(dialog)).height)).toBe(720);
});
