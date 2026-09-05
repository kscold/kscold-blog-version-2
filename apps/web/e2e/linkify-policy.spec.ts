import { expect, test } from '@playwright/test';
import { linkify } from '../src/shared/lib/linkify';
import { safeDecodeURIComponent } from '../src/shared/lib/safeDecodeURIComponent';

test.describe('본문 링크 분류 정책', () => {
  test('내부 글 주소의 인코딩된 슬러그를 해석한다', () => {
    expect(linkify('https://kscold.com/blog/AI%20Agent')).toEqual([
      {
        kind: 'blog-post',
        href: 'https://kscold.com/blog/AI%20Agent',
        slug: 'AI Agent',
      },
    ]);
  });

  test('잘못된 퍼센트 인코딩이 본문 렌더링을 중단하지 않는다', () => {
    expect(linkify('https://kscold.com/blog/%')).toEqual([
      {
        kind: 'blog-post',
        href: 'https://kscold.com/blog/%',
        slug: '%',
      },
    ]);
  });

  test('라우트 세그먼트도 잘못된 인코딩을 원문으로 보존한다', () => {
    expect(safeDecodeURIComponent('AI%20Agent')).toBe('AI Agent');
    expect(safeDecodeURIComponent('%')).toBe('%');
  });
});
