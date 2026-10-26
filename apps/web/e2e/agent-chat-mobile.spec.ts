import { expect, test } from '@playwright/test';
import { success } from './support/api';
import { prepareAgentChat } from './support/agent-chat';

const content = [
  '## AI Agent를 만들며 정리한 내용', '',
  '**검색한 기록**을 바탕으로 설명합니다. 10~20개, 30~40개 범위도 그대로 보여야 합니다.', '',
  '| 단계 | 설명 |', '| --- | --- |', '| 검색 | 질문과 가까운 공개 기록을 찾습니다 |', '| 답변 | 참고한 출처와 함께 설명합니다 |', '',
  '```typescript', 'const result = await searchPublicRecords(question);', '```', '',
  '![원격 이미지](https://example.invalid/tracker.png)', '',
  '자세한 기록은 【S1】에서 읽을 수 있습니다.',
].join('\n');

for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 960 }]) {
  test(viewport.width + 'px에서 표·코드·출처와 입력창이 채팅 안에 들어온다', async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    await prepareAgentChat(page);
    await page.route('**/api/vault/agent/history*', route => route.fulfill({ json: success({
      sessionId: 'mobile-answer',
      messages: [{ id: 'answer', role: 'assistant', content, stages: [{ name: '검색 완료', detail: '관련 기록을 확인했습니다.' }],
        sources: [{ id: 'source', title: 'AI Agent 개발 기록', type: 'blog', path: '/blog/agent/record', slug: 'record', score: 1 }] }],
    }) }));
    await page.goto('/feed?chat=open');
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'AI Agent를 만들며 정리한 내용' })).toHaveCount(1);
    await expect(dialog.locator('img')).toHaveCount(0);
    await expect(dialog.getByRole('link', { name: '출처 1', exact: true })).toHaveAttribute('href', '/blog/agent/record?chat=open');
    const input = dialog.getByRole('textbox', { name: 'Agent에게 보낼 질문' });
    await input.fill('내용을 조금 더 쉽게 설명해 주세요.\n어디부터 읽으면 좋을까요?');
    const bounds = await input.boundingBox();
    expect(bounds!.y + bounds!.height).toBeLessThan(viewport.height);
    expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
    await expect(dialog.getByText('추천 질문', { exact: true })).toHaveCount(0);
    await page.getByTestId('agent-message-list').evaluate(element => { element.scrollTop = 0; });
    await page.screenshot({ path: testInfo.outputPath('agent-' + viewport.width + '.png') });
  });
}

test('휴대폰 키보드로 보이는 높이가 줄어도 질문 입력창을 가리지 않는다', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await prepareAgentChat(page);
  await page.goto('/feed?chat=open');
  const input = page.getByRole('textbox', { name: 'Agent에게 보낼 질문' });
  await input.fill('키보드가 열린 상태의 질문');
  await page.evaluate(() => {
    Object.defineProperty(window.visualViewport!, 'height', { configurable: true, value: 500 });
    window.visualViewport!.dispatchEvent(new Event('resize'));
  });
  await expect.poll(async () => {
    const box = await input.boundingBox();
    return !!box && box.y >= 0 && box.y + box.height <= 500;
  }).toBe(true);
});
