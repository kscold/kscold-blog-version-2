import type { PageResponse } from '@/shared/model/types/api';
import type { Category, Post } from '@/shared/model/types/blog';
import { fetchPublicApi } from '@/shared/lib/seo';
import { CategoryPostContainer } from './CategoryPostContainer';

interface CategoryArchiveProps {
  category: Category;
}

export async function CategoryArchive({ category }: CategoryArchiveProps) {
  const [initialPosts, initialCategories] = await Promise.all([
    fetchPublicApi<PageResponse<Post>>(`/posts/category/${category.id}?page=0&size=12`),
    fetchPublicApi<Category[]>('/categories'),
  ]);

  return (
    <CategoryPostContainer
      category={category}
      initialPosts={initialPosts ?? undefined}
      initialCategories={initialCategories ?? undefined}
    />
  );
}
