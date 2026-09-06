import { cache } from 'react';
import { notFound, permanentRedirect } from 'next/navigation';
import { fetchPublicApi } from '@/shared/lib/seo';
import type { PageResponse } from '@/shared/model/types/api';
import type { Category, Post } from '@/shared/model/types/blog';
import { BLOG_ARCHIVE_PAGE_SIZE, parseBlogArchivePage } from './blogArchivePage';
import { validateBlogArchiveResponse } from './blogArchiveResponse';

const BLOG_CATEGORIES_TIMEOUT_MS = 2_000;

export const loadBlogArchive = cache(async (value: string | string[] | undefined) => {
  const page = parseBlogArchivePage(value);
  if (page === null) notFound();
  if (value === '1') permanentRedirect('/blog');

  const [postsResult, categoriesResult] = await Promise.allSettled([
    fetchPublicApi<PageResponse<Post>>(
      `/posts?page=${page - 1}&size=${BLOG_ARCHIVE_PAGE_SIZE}&sortBy=publishedAt&sortDirection=desc`,
      300
    ),
    fetchPublicApi<Category[]>('/categories', 300, {
      timeoutMs: BLOG_CATEGORIES_TIMEOUT_MS,
    }),
  ]);
  if (postsResult.status === 'rejected') throw postsResult.reason;
  const initialPosts = postsResult.value;
  if (!initialPosts) throw new Error('블로그 페이지를 불러올 수 없습니다.');
  if (!validateBlogArchiveResponse(initialPosts, page)) notFound();

  const initialCategories =
    categoriesResult.status === 'fulfilled' && Array.isArray(categoriesResult.value)
      ? categoriesResult.value
      : null;
  const categoriesDegraded = initialCategories === null;
  if (categoriesDegraded) {
    console.error('블로그 아카이브 보조 데이터 조회 실패', {
      route: '/blog',
      dependency: 'categories',
      page,
    });
  }

  return {
    page,
    initialPosts,
    initialCategories: initialCategories ?? [],
    categoriesDegraded,
  };
});
