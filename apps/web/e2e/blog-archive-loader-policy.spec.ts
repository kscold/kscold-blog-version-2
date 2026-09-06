import { expect, test } from '@playwright/test';
import { loadBlogArchive } from '../src/widgets/blog/lib/loadBlogArchive';

const emptyFirstPage = {
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

test('탐색 상한을 넘는 페이지는 백엔드 요청 전에 404를 반환한다', async () => {
  let requestCount = 0;
  await withFetchMock(
    async () => {
      requestCount += 1;
      return Response.json({ data: emptyFirstPage });
    },
    async () => {
      await expect(loadBlogArchive('501')).rejects.toThrow('NEXT_HTTP_ERROR_FALLBACK;404');
      expect(requestCount).toBe(0);
    }
  );
});

test('카테고리를 병렬 조회해도 범위 밖 페이지의 실제 404를 우선한다', async () => {
  const requests: string[] = [];
  let resolvePosts!: (response: Response) => void;
  const pendingPosts = new Promise<Response>(resolve => {
    resolvePosts = resolve;
  });
  await withFetchMock(
    async input => {
      const pathname = new URL(String(input)).pathname;
      requests.push(pathname);
      return pathname.endsWith('/posts') ? pendingPosts : new Response(null, { status: 503 });
    },
    async () => {
      const result = loadBlogArchive('2');
      expect(requests).toEqual(['/api/posts', '/api/categories']);
      resolvePosts(Response.json({ data: { ...emptyFirstPage, number: 1, first: false } }));
      await expect(result).rejects.toThrow('NEXT_HTTP_ERROR_FALLBACK;404');
    }
  );
});

test('유효한 빈 첫 페이지라도 카테고리 API 장애를 조용히 숨기지 않는다', async () => {
  await withFetchMock(
    async input =>
      new URL(String(input)).pathname.endsWith('/posts')
        ? Response.json({ data: emptyFirstPage })
        : new Response(null, { status: 503 }),
    async () => {
      await expect(loadBlogArchive(undefined)).rejects.toThrow('status=503');
    }
  );
});
