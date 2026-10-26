import { expect, test } from '@playwright/test';
import { parseMarkdownFile } from '../src/shared/lib/markdown-parser';

test('가져오기도 한글 자동 주소를 만들지 않고 명시된 주소를 유지한다', () => {
  const korean = parseMarkdownFile('제목.md', '# 한글 제목\n\n본문');
  expect(korean.slug).toBe('');
  expect(korean.parseWarnings.join(' ')).toContain('글 주소를 입력');
  expect(parseMarkdownFile('english.md', '# Hello World\n\n본문').slug).toBe('hello-world');
  expect(parseMarkdownFile('원문.md', '---\nslug: original-address\n---\n# 새 제목\n\n본문').slug).toBe('original-address');
});
