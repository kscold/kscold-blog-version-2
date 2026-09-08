import { expect, test } from '@playwright/test';
import { formatPublishedDate, toSeoDateTime } from '../src/shared/lib/seo/date';
import { buildPageMetadata } from '../src/shared/lib/seo/metadata';

test('서울 자정의 발행 시각은 실행 환경과 무관하게 같은 순간이다', () => {
  expect(toSeoDateTime('2026-09-08T00:30:00')).toBe('2026-09-07T15:30:00.000Z');
  expect(toSeoDateTime('2026-09-08T00:30:00+09:00')).toBe('2026-09-07T15:30:00.000Z');
  expect(toSeoDateTime('2026-09-07T15:30:00Z')).toBe('2026-09-07T15:30:00.000Z');
  expect(formatPublishedDate('2026-09-07T15:30:00Z')).toBe('2026년 9월 8일');
  expect(toSeoDateTime('invalid')).toBeUndefined();
});

test('기사 공유 메타데이터에도 서버 날짜의 시간대를 명시한다', () => {
  const metadata = buildPageMetadata({
    title: '날짜 검증', description: '서울 시각 검증', path: '/feed/test',
    type: 'article', publishedTime: '2026-09-08T00:30:00',
    modifiedTime: '2026-09-08T01:00:00',
  });
  expect(metadata.openGraph).toMatchObject({
    publishedTime: '2026-09-07T15:30:00.000Z',
    modifiedTime: '2026-09-07T16:00:00.000Z',
  });
});
