import { expect, test } from '@playwright/test';
import {
  MAX_ARCHIVE_PAGES,
  parseArchivePage,
} from '../src/widgets/blog/lib/archivePage';
import { validateArchiveResponse } from '../src/widgets/blog/lib/archiveResponse';
import { isPostSummary } from '../src/widgets/blog/lib/archiveGuards';

const isString = (item: unknown): item is string => typeof item === 'string';

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

test('빈 첫 페이지는 유효하고 빈 이후 페이지는 404 정책을 따른다', () => {
  expect(validateArchiveResponse(emptyFirstPage, 1, isString)).toBe(true);
  expect(validateArchiveResponse({ ...emptyFirstPage, number: 1, first: false }, 2, isString)).toBe(
    false
  );
});

test('응답 페이지가 다르거나 개수와 데이터가 모순되면 폴백 없이 실패한다', () => {
  expect(() => validateArchiveResponse(emptyFirstPage, 2, isString)).toThrow();
  expect(() =>
    validateArchiveResponse({ ...emptyFirstPage, content: ['숨은 글'] }, 1, isString)
  ).toThrow();
  expect(() =>
    validateArchiveResponse({ ...emptyFirstPage, totalPages: 1 }, 1, isString)
  ).toThrow();
  expect(() =>
    validateArchiveResponse({ ...emptyFirstPage, size: 100 }, 1, isString)
  ).toThrow();
});

test('콘텐츠 항목이 도메인 계약을 어기면 페이지 전체를 거부한다', () => {
  expect(() =>
    validateArchiveResponse(
      {
        ...emptyFirstPage,
        content: ['잘못된 항목'],
        totalElements: 1,
        totalPages: 1,
        empty: false,
      },
      1,
      (): never => {
        throw new Error('항목 계약 위반');
      }
    )
  ).toThrow('항목 계약 위반');
});

test('목록 포스트는 null 본문과 nullable 요약 필드를 허용한다', () => {
  const summary = {
    id: 'summary-1',
    title: '요약 글',
    slug: 'summary-1',
    content: null,
    excerpt: '요약',
    coverImage: null,
    category: { id: 'category-1', name: '카테고리', slug: 'category' },
    tags: [{ id: 'tag-1', name: '태그', slug: 'tag' }],
    author: { id: 'author-1', name: '작성자' },
    status: 'PUBLISHED',
    originalFilename: null,
    featured: false,
    restricted: null,
    views: 0,
    likes: 0,
    seo: { metaTitle: null, metaDescription: null, keywords: null },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
  expect(isPostSummary(summary)).toBe(true);
  expect(isPostSummary({ ...summary, content: '목록에 포함되면 안 되는 본문' })).toBe(false);
});

test('공개 탐색 상한 바로 다음 페이지부터 저장소 조회를 차단한다', () => {
  expect(parseArchivePage(String(MAX_ARCHIVE_PAGES))).toBe(MAX_ARCHIVE_PAGES);
  expect(parseArchivePage(String(MAX_ARCHIVE_PAGES + 1))).toBeNull();
  expect(parseArchivePage('2147483647')).toBeNull();
});
