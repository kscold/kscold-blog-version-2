import type { PageResponse } from '@/shared/model/types/api';
import type { Category, Post } from '@/shared/model/types/blog';
import { fetchPublicApi } from '@/shared/lib/seo';
import { BlogContainer } from './BlogContainer';

export async function BlogArchive() {
  const [initialPosts, initialCategories] = await Promise.all([
    fetchPublicApi<PageResponse<Post>>(
      '/posts?page=0&size=12&sortBy=publishedAt&sortDirection=desc'
    ),
    fetchPublicApi<Category[]>('/categories'),
  ]);

  return (
    <BlogContainer
      initialPosts={initialPosts ?? undefined}
      initialCategories={initialCategories ?? undefined}
    />
  );
}
