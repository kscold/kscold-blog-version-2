import { expect, test } from '@playwright/test';
import sitemap from '../src/app/sitemap';

const category = {
  id: 'category-1',
  name: 'AI',
  slug: 'ai',
  ancestors: [],
  depth: 0,
  order: 1,
  restricted: false,
  postCount: 5,
  createdAt: '2025-12-01T00:00:00',
  updatedAt: '2025-12-02T00:00:00',
};

const tag = {
  id: 'tag-1',
  name: 'LangGraph',
  slug: 'langgraph',
  postCount: 5,
  categoryId: category.id,
  createdAt: '2025-12-01T00:00:00',
};

function post(id: string, updatedAt: string, visibility: 'PUBLIC' | 'RESTRICTED' | 'ARCHIVED') {
  return {
    id,
    title: id,
    slug: id,
    content: '본문',
    excerpt: '요약',
    category: { id: category.id, name: category.name, slug: category.slug },
    tags: [{ id: tag.id, name: tag.name, slug: tag.slug }],
    author: { id: 'author-1', name: '김승찬' },
    status: visibility === 'ARCHIVED' ? 'ARCHIVED' : 'PUBLISHED',
    featured: false,
    restricted: visibility === 'RESTRICTED',
    views: 0,
    likes: 0,
    createdAt: updatedAt,
    updatedAt,
  };
}

test('사이트맵 갱신일은 색인 가능한 공개 콘텐츠의 최신 수정일을 따른다', async () => {
  const posts = [
    post('public-1', '2026-01-01T00:30:00', 'PUBLIC'),
    post('public-2', '2026-02-01T00:30:00', 'PUBLIC'),
    post('public-3', '2026-03-01T00:30:00', 'PUBLIC'),
    post('restricted', '2026-09-01T00:30:00', 'RESTRICTED'),
    post('archived', '2026-10-01T00:30:00', 'ARCHIVED'),
  ];
  const responses = new Map<string, unknown>([
    [
      '/api/posts',
      {
        content: posts,
        page: 0,
        size: 100,
        totalElements: posts.length,
        totalPages: 1,
        first: true,
        last: true,
        empty: false,
      },
    ],
    ['/api/categories', [category]],
    ['/api/tags', [tag]],
    ['/api/feeds/sitemap-index', []],
    [
      '/api/vault/notes/sitemap-index',
      [
        {
          slug: 'indexed-vault-note',
          contentLength: 1500,
          updatedAt: '2026-04-01T15:30:00Z',
        },
        {
          slug: 'thin-vault-note',
          contentLength: 1499,
          updatedAt: '2026-09-01T00:00:00Z',
        },
      ],
    ],
  ]);
  const originalFetch = global.fetch;
  global.fetch = async input => {
    const data = responses.get(new URL(String(input)).pathname);
    return data === undefined
      ? Response.json({ success: false }, { status: 404 })
      : Response.json({ success: true, data });
  };

  try {
    const entries = await sitemap();
    const categoryEntry = entries.find(entry => entry.url === 'https://kscold.com/blog/ai');
    const tagEntry = entries.find(
      entry => entry.url === 'https://kscold.com/blog/tags/langgraph'
    );
    const vaultEntry = entries.find(
      entry => entry.url === 'https://kscold.com/vault/indexed-vault-note'
    );

    expect(categoryEntry?.lastModified).toBe('2026-03-01');
    expect(tagEntry?.lastModified).toBe('2026-03-01');
    expect(vaultEntry?.lastModified).toBe('2026-04-02');
    expect(entries).not.toContainEqual(
      expect.objectContaining({ url: 'https://kscold.com/vault/thin-vault-note' })
    );
  } finally {
    global.fetch = originalFetch;
  }
});
