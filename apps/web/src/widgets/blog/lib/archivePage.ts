// 깊은 offset 조회와 캐시 키 증폭을 막으면서 최대 6천 개 글까지 탐색한다.
export const MAX_ARCHIVE_PAGES = 500;
export const ARCHIVE_PAGE_SIZE = 12;

export function parseArchivePage(value: string | string[] | undefined): number | null {
  if (value === undefined) return 1;
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null;
  const page = Number(value);
  return Number.isSafeInteger(page) && page <= MAX_ARCHIVE_PAGES ? page : null;
}

export function getArchivePagePath(basePath: string, page: number) {
  return page === 1 ? basePath : `${basePath}?page=${page}`;
}
