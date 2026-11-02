import { expect, test } from '@playwright/test';
import { findInteractiveDemoId } from '../src/shared/ui/interactive/interactiveDemoIds';
import { createNodes, getMajority, pickPrimary, toggleNode } from '../src/shared/ui/interactive/replica-set/replicaSetModel';
import { DEMO_QUERIES, getDistribution, getRouteStage, getTargetShards } from '../src/shared/ui/interactive/shard-key/shardKeyModel';

const DEMO_POST = '/blog/engineering/ci-interactive-demo';

function queryFilter(id: string) {
  const query = DEMO_QUERIES.find(option => option.id === id);
  if (!query) throw new Error(`없는 조회: ${id}`);
  return query.filter;
}

test('과반은 투표 멤버의 절반보다 많은 인원이고, 과반이 깨지면 Primary가 없다', () => {
  expect([2, 3, 5].map(getMajority)).toEqual([2, 2, 3]);

  const three = toggleNode(createNodes(3), 'A');
  expect(pickPrimary(three, 'A')).toBe('B');
  expect(pickPrimary(toggleNode(three, 'B'), 'B')).toBeNull();

  const two = toggleNode(createNodes(2), 'B');
  expect(pickPrimary(two, 'A')).toBeNull();
});

test('샤드 키에 따라 데이터 분포와 조회 대상 샤드가 실험 결과와 같게 나온다', () => {
  expect(getDistribution('workspace').map(share => share.percent)).toEqual([11.1, 88.9]);
  expect(getDistribution('workspace-channel').map(share => share.docs)).toEqual([10220, 9776]);

  expect(getTargetShards('workspace', queryFilter('hot-workspace'))).toEqual(['shard-b']);
  expect(getTargetShards('workspace-channel', queryFilter('hot-workspace'))).toEqual(['shard-a', 'shard-b']);
  expect(getTargetShards('workspace-channel', queryFilter('hot-channel'))).toEqual(['shard-b']);
  expect(getTargetShards('hashed-id', queryFilter('one-channel'))).toEqual(['shard-a', 'shard-b']);
  expect(getRouteStage(getTargetShards('workspace', queryFilter('full-search')))).toBe('SHARD_MERGE');
});

test('interactive 블록은 첫 줄의 이름이 등록된 데모일 때만 데모로 본다', () => {
  expect(findInteractiveDemoId('\nreplica-set-election\n')).toBe('replica-set-election');
  expect(findInteractiveDemoId('unknown-demo')).toBeNull();
});

test('레플리카셋 데모는 노드를 끄면 선거를 거쳐 쓰기 가능 여부를 바꾼다', async ({ page }) => {
  // CI 가짜 API의 데모 글을 쓴다.
  await page.goto(DEMO_POST);
  const demo = page.locator('[data-interactive-demo="replica-set-election"]');
  const verdict = demo.getByRole('status');
  await expect(verdict).toContainText('쓰기 가능 · Primary는 노드 A');

  await demo.getByRole('button', { name: '노드 A 끄기' }).click();
  await expect(verdict).toContainText('선거 중');
  await expect(verdict).toContainText('Primary는 노드 B', { timeout: 5000 });

  await demo.getByRole('button', { name: '노드 B 끄기' }).click();
  await expect(verdict).toContainText('쓰기 멈춤');
  await expect(demo.locator('[data-node-role="secondary"]')).toHaveCount(1);

  await demo.getByRole('button', { name: '2대', exact: true }).click();
  await demo.getByRole('button', { name: '노드 B 끄기' }).click();
  await expect(verdict).toContainText('켜진 노드 1/2대 · 과반 2대');
  await expect(verdict).toContainText('쓰기 멈춤');
});

test('샤드 키 데모는 키와 조회에 따라 보내는 샤드를 바꾼다', async ({ page }) => {
  await page.goto(DEMO_POST);
  const demo = page.locator('[data-interactive-demo="shard-key-routing"]');
  const route = demo.getByRole('status');
  await expect(route).toContainText('SINGLE_SHARD');
  await expect(demo.locator('[data-shard="shard-b"]')).toContainText('88.9%');

  await demo.getByRole('button', { name: "find({ workspaceId: 'ws-07' })", exact: true }).click();
  await expect(route).toContainText('shard-b 한 곳에만 물어요');

  await demo.getByRole('button', { name: '{ workspaceId: 1, channelId: 1 }', exact: true }).click();
  await expect(route).toContainText('SHARD_MERGE');
  await expect(demo.locator('[data-shard="shard-a"]')).toContainText('51.1%');
});

test('데모는 코드 상자 밖에 본문 글꼴로 그리고, 모르는 데모 이름은 코드 블록으로 남긴다', async ({ page }) => {
  await page.goto(DEMO_POST);
  await expect(page.locator('[data-interactive-demo]')).toHaveCount(2);
  await expect(page.locator('pre [data-interactive-demo]')).toHaveCount(0);

  const description = page.locator('[data-interactive-demo="replica-set-election"] section > p').nth(2);
  await expect(description).toBeVisible();
  const style = await description.evaluate(node => getComputedStyle(node));
  expect(style.whiteSpace).toBe('normal');
  expect(style.fontFamily).not.toContain('monospace');

  await expect(page.locator('article').getByText('unknown-demo', { exact: true })).toBeVisible();
});
