import { expect, test } from '@playwright/test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import {
  buildVaultTitleSlugMap,
  extractVaultWikiLinkTitles,
  processVaultNoteContent,
} from '../src/entities/vault';

test.describe('Vault 위키링크 SSR', () => {
  test('본문에서 링크 제목만 추출하고 마지막 중복 제목의 slug를 사용한다', () => {
    const content = '[[중복]] [[연결|표시]] ![[첨부.png]] [[중복]]';
    const referencedTitles = extractVaultWikiLinkTitles(content);
    const titleIndex = [
      { name: '중복', slug: 'old-slug' },
      { name: '무관한 노트', slug: 'unrelated' },
      { name: '연결', slug: 'linked' },
      { name: '중복', slug: 'latest-slug' },
    ];

    expect([...referencedTitles]).toEqual(['중복', '연결']);
    expect(buildVaultTitleSlugMap(titleIndex, referencedTitles)).toEqual({
      중복: 'latest-slug',
      연결: 'linked',
    });
  });

  test('변환 결과의 서버 렌더에 확인된 링크만 anchor로 출력한다', () => {
    const parsedContent = processVaultNoteContent(
      '[[연결 노트|표시 이름]]과 [[없는 노트]], [[constructor]], [[toString]]',
      { '연결 노트': 'linked-note' }
    );
    const html = renderToStaticMarkup(createElement(ReactMarkdown, null, parsedContent));

    expect(html).toContain('href="/vault/linked-note"');
    expect(html).not.toContain('href="/vault/missing-note"');
    expect(parsedContent).toContain('**constructor**');
    expect(parsedContent).toContain('**toString**');
    expect(parsedContent).not.toContain('[**constructor**](');
    expect(parsedContent).not.toContain('[**toString**](');
    expect(html).toContain('표시 이름');
    expect(html).toContain('없는 노트');
    expect(html).toContain('constructor');
    expect(html).toContain('toString');
  });

  test('상세 라우트의 초기 HTML에는 참조한 노트 링크만 직렬화한다', async ({ request }) => {
    const response = await request.get('/vault/ci-vault-wikilink');
    const html = await response.text();

    expect(response.status()).toBe(200);
    expect(html).toContain('href="/vault/linked-note"');
    expect(html).not.toContain('unrelated-note');
  });
});
