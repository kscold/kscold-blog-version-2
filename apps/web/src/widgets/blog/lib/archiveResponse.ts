import type { PageResponse } from '@/shared/model/types/api';
import { ARCHIVE_PAGE_SIZE } from './archivePage';

export function validateArchiveResponse<T>(
  posts: PageResponse<T>,
  page: number,
  isValidItem: (item: unknown) => item is T
): boolean {
  const hasValidNumbers = [posts.totalPages, posts.totalElements, posts.number, posts.size].every(
    value => Number.isSafeInteger(value) && value >= 0
  );
  const expectedCount = Math.max(
    0,
    Math.min(posts.size, posts.totalElements - posts.number * posts.size)
  );
  if (
    !hasValidNumbers ||
    !Array.isArray(posts.content) ||
    !posts.content.every(isValidItem) ||
    posts.number !== page - 1 ||
    posts.size !== ARCHIVE_PAGE_SIZE ||
    posts.content.length !== expectedCount ||
    posts.totalPages !== Math.ceil(posts.totalElements / posts.size) ||
    posts.empty !== (posts.content.length === 0) ||
    posts.first !== (page === 1) ||
    posts.last !== page >= posts.totalPages
  ) {
    throw new Error('아카이브 페이지 응답이 올바르지 않습니다.');
  }

  // 첫 페이지는 글이 없어도 유효하지만 이후 빈 페이지는 404 대상이다.
  return page === 1 || page <= posts.totalPages;
}
