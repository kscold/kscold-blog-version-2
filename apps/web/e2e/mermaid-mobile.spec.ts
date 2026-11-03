import { test, expect } from '@playwright/test';
import { expectFittedDiagram, openMermaidArticle } from './support/mermaid';
import { isPublicationStub } from './support/postPublication';

test.use({ hasTouch: true });
test.skip(!isPublicationStub, '가짜 글을 쓰는 로컬 스텁에서만 실행합니다.');

for (const width of [320, 393, 402, 1440]) {
  test(`${width}px 본문에서 막대 그래프 전체가 잘리거나 비율이 달라지지 않는다`, async ({ page, request }) => {
    await page.setViewportSize({ width, height: 874 });
    const block = await openMermaidArticle({ page, request });
    await expectFittedDiagram(block);
    await expect(page.locator('pre [data-mermaid-block]')).toHaveCount(0);
    const labels = await block.locator('svg text').evaluateAll(elements => elements
      .filter(element => /^\d+월$/.test(element.textContent ?? ''))
      .map(element => {
        const label = element.getBoundingClientRect();
        const svg = element.closest('svg')!.getBoundingClientRect();
        return { text: element.textContent, inside: label.left >= svg.left && label.right <= svg.right };
      }));
    expect(labels).toHaveLength(10);
    expect(labels.every(label => label.inside)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    if (width < 640) {
      const styles = await page.locator('.markdown-prose > p').first().evaluate(element => {
        const style = getComputedStyle(element);
        return { size: parseFloat(style.fontSize), lineHeight: parseFloat(style.lineHeight), break: style.wordBreak };
      });
      expect(styles.size).toBeGreaterThanOrEqual(16);
      expect(styles.size).toBeLessThanOrEqual(18);
      expect(styles.lineHeight / styles.size).toBeGreaterThanOrEqual(1.7);
      expect(styles.break).toBe('keep-all');
    }
  });
}

test('도표 위의 휠과 한 손가락 스와이프는 본문을 스크롤한다', async ({ page, request }) => {
  await page.setViewportSize({ width: 402, height: 874 });
  const block = await openMermaidArticle({ page, request });
  const diagram = block.locator('svg');
  await diagram.hover();
  const before = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 150);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 50);
  await block.scrollIntoViewIfNeeded();
  const bounds = await diagram.boundingBox();
  const startY = Math.min(bounds!.y + bounds!.height - 20, 700);
  const client = await page.context().newCDPSession(page);
  const start = await page.evaluate(() => scrollY);
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 200, y: startY }] });
  for (let offset = 20; offset <= 120; offset += 20) {
    await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 200, y: startY - offset }] });
  }
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(start + 50);
  await expectFittedDiagram(block);
});

test('확대 화면은 원본·화면 맞춤·확대와 이동이 가능하고 닫으면 읽던 위치로 돌아온다', async ({ page, request }) => {
  await page.setViewportSize({ width: 402, height: 874 });
  const block = await openMermaidArticle({ page, request });
  const trigger = block.getByRole('button', { name: '크게 보기' });
  const svgId = await block.locator('svg').getAttribute('id');
  await trigger.click();
  const scrollPosition = await page.evaluate(() => scrollY);
  const dialog = page.getByRole('dialog', { name: '도표 크게 보기' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('status', { name: '도표 배율' })).toHaveText('100%');
  await expect(page.locator(`svg[id="${svgId}"]`)).toHaveCount(1);
  for (let step = 0; step < 9; step++) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
  }
  await dialog.getByRole('button', { name: '닫기' }).focus();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('region', { name: '확대한 도표' })).toBeFocused();
  const region = dialog.getByRole('region', { name: '확대한 도표' });
  await region.evaluate(element => { element.scrollLeft = element.scrollWidth; });
  expect(await region.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
  await dialog.getByRole('button', { name: '도표 확대', exact: true }).click();
  await expect(dialog.getByRole('status', { name: '도표 배율' })).toHaveText('125%');
  await dialog.getByRole('button', { name: '화면 맞춤' }).click();
  await expect.poll(() => region.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);
  await page.setViewportSize({ width: 874, height: 402 });
  await expect.poll(() => region.evaluate(element => element.scrollHeight - element.clientHeight)).toBeLessThanOrEqual(1);
  await dialog.getByRole('button', { name: '원본 크기' }).click();
  await expect(dialog.getByRole('status', { name: '도표 배율' })).toHaveText('100%');
  await page.setViewportSize({ width: 402, height: 874 });
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(Math.abs(await page.evaluate(() => scrollY) - scrollPosition)).toBeLessThanOrEqual(2);
  await expectFittedDiagram(block);
});

test('문법 오류는 원본을 읽을 수 있는 상자로 표시하고 다음 도표는 정상 렌더링한다', async ({ page, request }) => {
  await openMermaidArticle({ page, request, content: [
    '```mermaid', 'flowchart TD', 'A --> B', '```', '',
    '```mermaid', 'not a valid diagram', '```', '',
    '```mermaid', 'flowchart TD', 'C --> D', '```',
  ].join('\n') });
  const invalid = page.locator('[data-mermaid-block]').nth(1);
  await invalid.scrollIntoViewIfNeeded();
  await expect(invalid.locator('[data-mermaid-status]')).toHaveAttribute('data-mermaid-status', 'error');
  await expect(invalid.getByRole('button', { name: '크게 보기' })).toBeDisabled();
  await expect(invalid.locator('pre code')).toHaveText('not a valid diagram');
  const next = page.locator('[data-mermaid-block]').nth(2);
  await next.scrollIntoViewIfNeeded();
  await expect(next.locator('[data-mermaid-status]')).toHaveAttribute('data-mermaid-status', 'rendered');
});

test('커스텀 커서가 켜져 있어도 브라우저 최상위 확대 창에서는 포인터가 보인다', async ({ page, request }) => {
  const block = await openMermaidArticle({ page, request });
  // CI의 GPU 종류와 관계없이 커스텀 커서가 기본 포인터를 숨기는 조건을 재현한다.
  await page.locator('html').evaluate(element => element.classList.add('custom-cursor-active'));
  await block.getByRole('button', { name: '크게 보기' }).click();
  const dialog = page.getByRole('dialog', { name: '도표 크게 보기' });
  await expect(dialog).toBeVisible();
  await expect(dialog).not.toHaveCSS('cursor', 'none');
  await expect(dialog.getByRole('button', { name: '닫기' })).toHaveCSS('cursor', 'pointer');
  await dialog.getByRole('button', { name: '닫기' }).click();
  await expect(page.locator('html')).toHaveClass(/custom-cursor-active/);
});

test('화면 폭이 바뀌어도 흐름도 라벨과 일반 코드의 줄바꿈을 유지한다', async ({ page, request }) => {
  await openMermaidArticle({ page, request });
  const flowchart = page.locator('[data-mermaid-block]').nth(1);
  await flowchart.scrollIntoViewIfNeeded();
  await expect(flowchart.locator('[data-mermaid-status]')).toHaveAttribute('data-mermaid-status', 'rendered');
  await page.setViewportSize({ width: 393, height: 852 });
  const svg = flowchart.locator('svg');
  await expect(svg).toBeVisible();
  const overflow = await svg.evaluate(element => element.getBoundingClientRect().right - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await expect(page.locator('pre pre')).toHaveCount(0);
  await expect(page.locator('code').filter({ hasText: '첫 줄은 그대로' })).toHaveText('첫 줄은 그대로 둡니다.\n    둘째 줄은 네 칸 들여씁니다.');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});
