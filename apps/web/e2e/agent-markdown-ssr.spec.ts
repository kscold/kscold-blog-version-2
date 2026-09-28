import { test, expect } from '@playwright/test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AgentMarkdown } from '../src/shared/ui/AgentMarkdown';

function render(content: string) {
  return renderToStaticMarkup(createElement(AgentMarkdown, { content, sectionIds: ['sample'] }));
}

test('답변의 제목·강조·목록·표·인라인 코드·코드 블록을 렌더링한다', () => {
  const html = render([
    '### 역할 요약', '', '**담당 범위**와 `Plan`을 설명합니다.', '',
    '- 계획', '- 검증', '', '| 단계 | 담당 |', '| --- | --- |', '| 실행 | 코드 |', '',
    '```ts', 'const plan = "검증";', '```', '', '> 조건을 유지합니다.',
  ].join('\n'));
  expect(html).toContain('<h3>역할 요약</h3>');
  expect(html).toContain('<strong>담당 범위</strong>');
  expect(html).toContain('<li>계획</li>');
  expect(html).toContain('<table');
  expect(html).toContain('aria-label="답변 표"');
  expect(html).toContain('<code>Plan</code>');
  expect(html).toContain('class="language-ts"');
  expect(html).toContain('<blockquote>');
});

test('페이지의 실제 앵커만 링크로 남긴다', () => {
  const html = render('[근거](#sample) [없는 근거](#unknown) [외부](https://example.invalid)');
  expect(html).toContain('href="#sample"');
  expect(html).not.toContain('href="#unknown"');
  expect(html).not.toContain('href="https:');
  expect(html).toContain('<span>없는 근거</span>');
  expect(html).toContain('<span>외부</span>');
});

test('HTML·이미지·실행 URL·외부 자동 링크로 요청하거나 실행하지 않는다', () => {
  const html = render([
    '<script>alert("test")</script>', '', '<iframe src="https://example.invalid"></iframe>', '',
    '![추적 이미지](https://example.invalid/pixel)', '', '[실행](javascript:alert)',
    '[데이터](data:text/html,test) [상대](//example.invalid) https://example.invalid',
  ].join('\n'));
  expect(html).not.toMatch(/<(script|iframe|img)\b/);
  expect(html).not.toContain('href=');
  expect(html).not.toContain('src=');
});

test('부분 스트리밍과 CRLF 입력에도 렌더링 오류가 없다', () => {
  const markdown = '### 요약\r\n\r\n**핵심**\r\n\r\n- 항목\r\n\r\n```ts\r\nconst value = 1;\r\n```';
  for (let length = 1; length <= markdown.length; length++) {
    expect(() => render(markdown.slice(0, length))).not.toThrow();
  }
  expect(render(markdown)).toContain('<strong>핵심</strong>');
});

test('사용자가 질문에 쓴 상위 제목을 답변 안에서는 낮춘다', () => {
  const html = render('# 제목\n\n## 소제목');
  expect(html).not.toMatch(/<h[12]>/);
  expect(html).toContain('<h3>제목</h3>');
  expect(html).toContain('<h3>소제목</h3>');
});

test('완료·미완료 목록은 조작할 수 없는 이름 있는 체크박스로 표시한다', () => {
  const html = render('- [x] 검증 완료\n- [ ] 추가 확인');
  expect(html).toContain('aria-label="완료한 항목"');
  expect(html).toContain('aria-label="미완료 항목"');
  expect(html.match(/disabled=""/g)).toHaveLength(2);
});
