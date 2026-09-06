import { expect, test } from '@playwright/test';
import { generateMetadata } from '../src/app/blog/tags/[slug]/page';

test('태그 메타데이터는 경량 공개 집계만 한 번 조회한다', async () => {
  const requestedUrls: string[] = [];
  const originalFetch = global.fetch;
  global.fetch = async input => {
    requestedUrls.push(String(input));
    return Response.json({
      success: true,
      data: [
        {
          id: 'tag-1',
          name: 'LangGraph',
          slug: 'langgraph',
          categoryId: 'category-1',
          categoryName: 'AI',
          postCount: 8,
          publicPostCount: 3,
          feedCount: 2,
          totalCount: 10,
          unregistered: false,
        },
      ],
    });
  };

  try {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'langgraph' }),
    });

    expect(metadata.robots).toBeUndefined();
  } finally {
    global.fetch = originalFetch;
  }

  expect(requestedUrls).toHaveLength(1);
  expect(new URL(requestedUrls[0]).pathname).toBe('/api/tags/index');
});

test('공개 글 수가 누락된 태그는 큰 전체 글 수와 무관하게 색인하지 않는다', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () =>
    Response.json({
      success: true,
      data: [
        {
          id: 'tag-legacy',
          name: '에이전트',
          slug: '에이전트',
          categoryId: null,
          categoryName: null,
          postCount: 99,
          feedCount: 0,
          totalCount: 99,
          unregistered: false,
        },
      ],
    });

  try {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: encodeURIComponent('에이전트') }),
    });

    expect(metadata.robots).toMatchObject({ index: false, follow: false });
    expect(metadata.alternates?.canonical).toBe(
      'https://kscold.com/blog/tags/%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8'
    );
  } finally {
    global.fetch = originalFetch;
  }
});
