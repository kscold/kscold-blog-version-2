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

async function captureConsoleErrors(run: () => Promise<void>) {
  const originalError = console.error;
  const errorCalls: unknown[][] = [];
  console.error = (...args: unknown[]) => errorCalls.push(args);
  try {
    await run();
  } finally {
    console.error = originalError;
  }
  return errorCalls;
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

test('카테고리 API 장애를 기록하고 유효한 글 아카이브는 유지한다', async () => {
  const errorCalls = await captureConsoleErrors(() =>
    withFetchMock(
      async input =>
        new URL(String(input)).pathname.endsWith('/posts')
          ? Response.json({ data: emptyFirstPage })
          : new Response(null, { status: 503 }),
      async () => {
        const archive = await loadBlogArchive(undefined);
        expect(archive.initialPosts).toEqual(emptyFirstPage);
        expect(archive.initialCategories).toEqual([]);
        expect(archive.categoriesDegraded).toBe(true);
      }
    )
  );

  expect(errorCalls).toEqual([
    [
      '블로그 아카이브 보조 데이터 조회 실패',
      { route: '/blog', dependency: 'categories', page: 1 },
    ],
  ]);
});

for (const scenario of [
  { name: '404 응답', response: () => new Response(null, { status: 404 }) },
  { name: '배열이 아닌 응답', response: () => Response.json({ data: { invalid: true } }) },
]) {
  test(`카테고리 ${scenario.name}도 안전한 저하 상태로 처리한다`, async () => {
    const errorCalls = await captureConsoleErrors(() =>
      withFetchMock(
        async input =>
          new URL(String(input)).pathname.endsWith('/posts')
            ? Response.json({ data: emptyFirstPage })
            : scenario.response(),
        async () => {
          const archive = await loadBlogArchive(undefined);
          expect(archive.initialCategories).toEqual([]);
          expect(archive.categoriesDegraded).toBe(true);
        }
      )
    );

    expect(errorCalls).toHaveLength(1);
  });
}

test('카테고리 조회는 짧은 제한 시간을 사용하고 정상 배열을 보존한다', async () => {
  const originalTimeout = AbortSignal.timeout;
  const timeoutCalls: number[] = [];
  AbortSignal.timeout = (milliseconds: number) => {
    timeoutCalls.push(milliseconds);
    return originalTimeout(milliseconds);
  };

  try {
    await withFetchMock(
      async input =>
        new URL(String(input)).pathname.endsWith('/posts')
          ? Response.json({ data: emptyFirstPage })
          : Response.json({ data: [] }),
      async () => {
        const archive = await loadBlogArchive(undefined);
        expect(archive.initialCategories).toEqual([]);
        expect(archive.categoriesDegraded).toBe(false);
      }
    );
  } finally {
    AbortSignal.timeout = originalTimeout;
  }

  expect(timeoutCalls).toContain(2_000);
});

test('포스트 API 장애는 카테고리 성공 여부와 관계없이 전파한다', async () => {
  await withFetchMock(
    async input =>
      new URL(String(input)).pathname.endsWith('/posts')
        ? new Response(null, { status: 503 })
        : Response.json({ data: [] }),
    async () => {
      await expect(loadBlogArchive(undefined)).rejects.toThrow('status=503');
    }
  );
});
