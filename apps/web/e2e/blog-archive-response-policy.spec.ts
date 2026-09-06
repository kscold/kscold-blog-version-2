import { expect, test } from '@playwright/test';
import {
  MAX_BLOG_ARCHIVE_PAGES,
  parseBlogArchivePage,
} from '../src/widgets/blog/lib/blogArchivePage';
import { validateBlogArchiveResponse } from '../src/widgets/blog/lib/blogArchiveResponse';

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
  expect(validateBlogArchiveResponse(emptyFirstPage, 1)).toBe(true);
  expect(validateBlogArchiveResponse({ ...emptyFirstPage, number: 1, first: false }, 2)).toBe(
    false
  );
});

test('응답 페이지가 다르거나 개수와 데이터가 모순되면 폴백 없이 실패한다', () => {
  expect(() => validateBlogArchiveResponse(emptyFirstPage, 2)).toThrow();
  expect(() =>
    validateBlogArchiveResponse({ ...emptyFirstPage, content: ['숨은 글'] }, 1)
  ).toThrow();
  expect(() => validateBlogArchiveResponse({ ...emptyFirstPage, totalPages: 1 }, 1)).toThrow();
  expect(() => validateBlogArchiveResponse({ ...emptyFirstPage, size: 100 }, 1)).toThrow();
});

test('공개 탐색 상한 바로 다음 페이지부터 저장소 조회를 차단한다', () => {
  expect(parseBlogArchivePage(String(MAX_BLOG_ARCHIVE_PAGES))).toBe(MAX_BLOG_ARCHIVE_PAGES);
  expect(parseBlogArchivePage(String(MAX_BLOG_ARCHIVE_PAGES + 1))).toBeNull();
  expect(parseBlogArchivePage('2147483647')).toBeNull();
});
