import { cache } from 'react';
import { notFound, permanentRedirect } from 'next/navigation';
import { fetchPublicApi } from '@/shared/lib/seo';
import type { PageResponse } from '@/shared/model/types/api';
import type { Category, PostSummary } from '@/shared/model/types/blog';
import { ARCHIVE_PAGE_SIZE, getArchivePagePath, parseArchivePage } from './archivePage';
import { isCategory, isPostSummary } from './archiveGuards';
import { validateArchiveResponse } from './archiveResponse';

const CATEGORIES_TIMEOUT_MS = 2_000;

export interface CategoryArchiveData {
  page: number;
  basePath: string;
  category: Category;
  initialPosts: PageResponse<PostSummary>;
  initialCategories: Category[];
  categoriesDegraded: boolean;
}

const getCategory = cache(async (categorySlug: string) => {
  const category = await fetchPublicApi<Category>(
    `/categories/slug/${encodeURIComponent(categorySlug)}`,
    300
  );
  if (category === null) notFound();
  if (!isCategory(category)) throw new Error('카테고리 응답이 올바르지 않습니다.');
  return category;
});

export const loadCategoryArchive = cache(
  async (
    categorySlug: string,
    value: string | string[] | undefined
  ): Promise<CategoryArchiveData> => {
    const page = parseArchivePage(value);
    if (page === null) notFound();
    const requestedPath = `/blog/${encodeURIComponent(categorySlug)}`;
    if (value === '1') permanentRedirect(requestedPath);

    const category = await getCategory(categorySlug);
    const basePath = `/blog/${encodeURIComponent(category.slug)}`;
    const [postsResult, categoriesResult] = await Promise.allSettled([
      fetchPublicApi<PageResponse<PostSummary>>(
        `/posts/category/${encodeURIComponent(category.id)}?page=${page - 1}&size=${ARCHIVE_PAGE_SIZE}`,
        300
      ),
      fetchPublicApi<Category[]>('/categories', 300, { timeoutMs: CATEGORIES_TIMEOUT_MS }),
    ]);
    if (postsResult.status === 'rejected') throw postsResult.reason;
    if (postsResult.value === null) throw new Error('카테고리 포스트를 불러올 수 없습니다.');
    if (!validateArchiveResponse(postsResult.value, page, isPostSummary)) notFound();

    const initialCategories = getValidCategories(categoriesResult);
    const categoriesDegraded = initialCategories === null;
    if (categoriesDegraded) logCategoriesFailure(basePath, page);
    return {
      page,
      basePath: getArchivePagePath(basePath, 1),
      category,
      initialPosts: postsResult.value,
      initialCategories: initialCategories ?? [],
      categoriesDegraded,
    };
  }
);

function getValidCategories(result: PromiseSettledResult<Category[] | null>) {
  return result.status === 'fulfilled' &&
    Array.isArray(result.value) &&
    result.value.every(isCategory)
    ? result.value
    : null;
}

function logCategoriesFailure(route: string, page: number) {
  console.error('카테고리 아카이브 보조 데이터 조회 실패', {
    route,
    dependency: 'categories',
    page,
  });
}
