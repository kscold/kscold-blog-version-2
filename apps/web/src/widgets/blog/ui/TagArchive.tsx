import type { PageResponse } from '@/shared/model/types/api';
import type { Post, Tag } from '@/shared/model/types/blog';
import { fetchPublicApi } from '@/shared/lib/seo';
import { TagPostContainer } from './TagPostContainer';

interface TagArchiveProps {
  tag: Tag;
}

export async function TagArchive({ tag }: TagArchiveProps) {
  const initialPosts = await fetchPublicApi<PageResponse<Post>>(
    `/posts/tag/${tag.id}?page=0&size=12`
  );

  return <TagPostContainer tag={tag} initialPosts={initialPosts ?? undefined} />;
}
