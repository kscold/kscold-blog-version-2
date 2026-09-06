import { expect, test } from '@playwright/test';
import { loadBlogArchive } from '../src/widgets/blog/lib/loadBlogArchive';
import { loadCategoryArchive } from '../src/widgets/blog/lib/loadCategoryArchive';
import { loadTagArchive } from '../src/widgets/blog/lib/loadTagArchive';

const BUILD_API_ORIGIN = process.env.BUILD_API_ORIGIN || 'http://127.0.0.1:4100';

const category = {
  id: 'category-policy',
  name: '정책 카테고리',
  slug: 'category-policy',
  ancestors: [],
  depth: 0,
  order: 0,
  postCount: 0,
  createdAt: null,
  updatedAt: null,
};
const emptyPage = {
  content: [],
  number: 0,
  size: 12,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
  empty: true,
};

async function withFetchMock(mock: typeof fetch, run: () => Promise<void>) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = mock;
  try {
    await run();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

test('잘못된 페이지는 카테고리와 태그 API 호출 전에 404 처리한다', async () => {
  let requestCount = 0;
  await withFetchMock(
    async () => {
      requestCount += 1;
      return Response.json({ data: null });
    },
    async () => {
      await expect(loadCategoryArchive('invalid-category', '501')).rejects.toThrow(
        'NEXT_HTTP_ERROR_FALLBACK;404'
      );
      await expect(loadTagArchive('invalid-tag', ['2'])).rejects.toThrow(
        'NEXT_HTTP_ERROR_FALLBACK;404'
      );
    }
  );
  expect(requestCount).toBe(0);
});

test('카테고리 보조 목록 장애만 2초 제한과 고정 로그로 저하 처리한다', async () => {
  const timeoutCalls: number[] = [];
  const errorCalls: unknown[][] = [];
  const originalTimeout = AbortSignal.timeout;
  const originalError = console.error;
  AbortSignal.timeout = (milliseconds: number) => {
    timeoutCalls.push(milliseconds);
    return originalTimeout(milliseconds);
  };
  console.error = (...args: unknown[]) => errorCalls.push(args);
  try {
    await withFetchMock(
      async input => {
        const pathname = new URL(String(input)).pathname;
        if (pathname.includes('/categories/slug/')) return Response.json({ data: category });
        if (pathname.includes('/posts/category/')) return Response.json({ data: emptyPage });
        return new Response(null, { status: 503 });
      },
      async () => {
        const archive = await loadCategoryArchive('category-policy', undefined);
        expect(archive.initialPosts).toEqual(emptyPage);
        expect(archive.initialCategories).toEqual([]);
        expect(archive.categoriesDegraded).toBe(true);
      }
    );
  } finally {
    AbortSignal.timeout = originalTimeout;
    console.error = originalError;
  }
  expect(timeoutCalls).toContain(2_000);
  expect(errorCalls).toEqual([
    [
      '카테고리 아카이브 보조 데이터 조회 실패',
      { route: '/blog/category-policy', dependency: 'categories', page: 1 },
    ],
  ]);
});

test('필수 카테고리와 태그 색인의 잘못된 응답은 404로 숨기지 않는다', async () => {
  await withFetchMock(
    async input => {
      const pathname = new URL(String(input)).pathname;
      return pathname.includes('/categories/slug/')
        ? Response.json({ data: { id: 'broken' } })
        : Response.json({ data: [{ id: 'broken', slug: 'broken-tag' }] });
    },
    async () => {
      await expect(loadCategoryArchive('broken-category', undefined)).rejects.toThrow(
        '카테고리 응답이 올바르지 않습니다.'
      );
      await expect(loadTagArchive('broken-tag', undefined)).rejects.toThrow(
        '대상 태그 응답이 올바르지 않습니다.'
      );
    }
  );
});

test('요청과 무관한 잘못된 태그 항목은 대상 태그 아카이브를 막지 않는다', async () => {
  await withFetchMock(
    async input => {
      const pathname = new URL(String(input)).pathname;
      if (pathname.includes('/posts/tag/')) return Response.json({ data: emptyPage });
      return Response.json({
        data: [
          { id: 'unrelated-broken', slug: 'unrelated' },
          {
            id: 'target-tag',
            name: '대상 태그',
            slug: 'target',
            categoryId: null,
            categoryName: null,
            postCount: 0,
            publicPostCount: 0,
            feedCount: 0,
            totalCount: 0,
            unregistered: false,
          },
        ],
      });
    },
    async () => {
      const archive = await loadTagArchive('target', undefined);
      expect(archive.tag.id).toBe('target-tag');
      expect(archive.initialPosts).toEqual(emptyPage);
    }
  );
});

test('CI 스텁의 null 본문 목록은 세 아카이브의 두 번째 페이지 계약을 만족한다', async () => {
  const originalFetch = globalThis.fetch;
  await withFetchMock(
    async input => {
      const requested = new URL(String(input));
      return originalFetch(`${BUILD_API_ORIGIN}${requested.pathname}${requested.search}`);
    },
    async () => {
      const [blog, categoryArchive, tagArchive] = await Promise.all([
        loadBlogArchive('2'),
        loadCategoryArchive('dev-story', '2'),
        loadTagArchive('public', '2'),
      ]);
      expect(blog.initialPosts.number).toBe(1);
      expect(categoryArchive.initialPosts.totalElements).toBe(16);
      expect(tagArchive.initialPosts.totalElements).toBe(19);
    }
  );
});
