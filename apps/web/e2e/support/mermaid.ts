import { expect, type APIRequestContext, type Page, type Locator } from '@playwright/test';
import { isolateBackendApi, mockShellApis } from './api';
import { isPublicationStub, PUBLIC_CATEGORY, seedPublication } from './postPublication';

export const MERMAID_ARTICLE = [
  '모바일에서도 문장 사이의 여백과 줄바꿈을 유지하며 읽습니다. 자연스럽게 이어지는 문단입니다.', '',
  '## 작은 화면에서도 전체 흐름을 읽을 수 있는 도표', '',
  '```mermaid',
  '%%{init: {"themeVariables": {"xyChart": {"plotColorPalette": "#4C6EF5"}}}}%%',
  'xychart-beta',
  '  title "사이드 프로젝트에서 서비스까지, 월별 커밋 수"',
  '  x-axis ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월"]',
  '  y-axis "커밋" 0 --> 350',
  '  bar [5, 0, 116, 45, 3, 1, 0, 0, 4, 331]',
  '```', '',
  '도표 위에서도 손가락을 올려 본문을 계속 읽을 수 있어야 합니다.', '',
  '## 요청이 처리되는 흐름', '',
  '```mermaid',
  'flowchart LR',
  '  A[자연어로 요청하기] --> B[내용을 확인하고 계획하기] --> C[분석 결과를 검증하기] --> D[결과 공유하기]',
  '```', '',
  '## 긴 문자열과 코드', '',
  '`MongoDBReplicaSetConnectionConfigurationWithoutWhitespace` 같은 긴 이름도 읽을 수 있습니다.', '',
  '```ts', 'const configuration = "공백 없는 문자열도 코드 안에서만 스크롤합니다";', '```', '',
  '```', '첫 줄은 그대로 둡니다.', '    둘째 줄은 네 칸 들여씁니다.', '```', '',
  '| 항목 | 설명 |', '| --- | --- |', '| 요청 | 본문 바깥으로 넘치지 않습니다. |', '',
  ...Array.from({ length: 8 }, () => '다음 문단을 계속 읽습니다. 문서 전체의 가로 스크롤이나 도표의 확대가 생기지 않아야 합니다.\n'),
].join('\n');

export async function openMermaidArticle({ page, request, content = MERMAID_ARTICLE }: {
  page: Page; request: APIRequestContext; content?: string;
}) {
  if (!isPublicationStub) throw new Error('도표 검사는 로컬 스텁에서만 실행합니다.');
  await isolateBackendApi(page);
  await mockShellApis(page);
  const post = await seedPublication(request, {
    categoryId: PUBLIC_CATEGORY, status: 'PUBLISHED',
    title: '작은 화면에서도 편하게 읽는 개발 이야기 (feat. 모바일 가독성)', content,
  });
  await page.goto(`/blog/${post.category.slug}/${post.slug}`);
  const block = page.locator('[data-mermaid-block]').first();
  await block.scrollIntoViewIfNeeded();
  await expect(block.locator('[data-mermaid-status]')).toHaveAttribute('data-mermaid-status', 'rendered');
  return block;
}

export async function expectFittedDiagram(block: Locator) {
  const bounds = await block.locator('svg').evaluate(svg => {
    const frame = svg.closest('[data-mermaid-block]')!.getBoundingClientRect();
    const rect = svg.getBoundingClientRect();
    const viewBox = (svg as SVGSVGElement).viewBox.baseVal;
    return { left: rect.left - frame.left, right: frame.right - rect.right,
      width: rect.width, height: rect.height, ratio: viewBox.width / viewBox.height };
  });
  expect(bounds.left).toBeGreaterThanOrEqual(0);
  expect(bounds.right).toBeGreaterThanOrEqual(0);
  expect(bounds.width / bounds.height).toBeCloseTo(bounds.ratio, 2);
  expect(bounds.height).toBeGreaterThan(100);
}
