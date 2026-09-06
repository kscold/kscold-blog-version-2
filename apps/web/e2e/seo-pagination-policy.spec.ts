import { expect, test } from '@playwright/test';
import { fetchAllPublicApiPages, fetchPublicApi } from '../src/shared/lib/seo/fetch';

test.describe('SEO 페이지 수집 정책', () => {
  test('페이지 크기를 백엔드 상한으로 제한한다', async () => {
    const requestedUrls: string[] = [];
    const originalFetch = global.fetch;
    global.fetch = async input => {
      requestedUrls.push(String(input));
      return Response.json({ content: [], last: true, totalPages: 0 });
    };

    try {
      await fetchAllPublicApiPages('/posts', 10_000);
    } finally {
      global.fetch = originalFetch;
    }

    expect(requestedUrls).toHaveLength(1);
    expect(requestedUrls[0]).toContain('page=0&size=100');
  });

  test('비어 있는 중간 페이지에서는 수집을 중단한다', async () => {
    const originalFetch = global.fetch;
    global.fetch = async () =>
      Response.json({ content: [], last: false, number: 0, totalPages: 2 });

    try {
      await expect(fetchAllPublicApiPages('/posts')).rejects.toThrow(
        'SEO API 페이지 수집이 진행되지 않습니다.'
      );
    } finally {
      global.fetch = originalFetch;
    }
  });

  test('페이지 요청이 안전 상한을 넘으면 중단한다', async () => {
    let requestCount = 0;
    const originalFetch = global.fetch;
    global.fetch = async () => {
      requestCount += 1;
      return Response.json({ content: [requestCount], last: false, totalPages: 501 });
    };

    try {
      await expect(fetchAllPublicApiPages('/posts')).rejects.toThrow(
        'SEO API 페이지 수가 안전 상한을 초과했습니다.'
      );
    } finally {
      global.fetch = originalFetch;
    }

    expect(requestCount).toBe(500);
  });

  test('호출자가 전달한 중단 신호를 전역 제한 시간으로 교체하지 않는다', async () => {
    const controller = new AbortController();
    const originalFetch = global.fetch;
    let receivedSignal: AbortSignal | null | undefined;
    global.fetch = async (_input, init) => {
      receivedSignal = init?.signal;
      return Response.json({ data: [] });
    };

    try {
      await fetchPublicApi('/signal-check', 60, {
        signal: controller.signal,
        timeoutMs: 1,
      });
    } finally {
      global.fetch = originalFetch;
    }

    expect(receivedSignal).toBe(controller.signal);
  });
});
