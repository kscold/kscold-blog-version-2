import type { PageResponse } from '@/shared/model/types/api';
import type { Category, Post } from '@/shared/model/types/blog';
import { JsonLd } from '@/shared/ui/JsonLd';
import { buildBlogArchiveJsonLd } from '../lib/blogArchiveMetadata';
import { BlogContainer } from './BlogContainer';

export interface BlogArchiveProps {
  page: number;
  initialPosts: PageResponse<Post>;
  initialCategories: Category[];
  categoriesDegraded: boolean;
}

export function BlogArchive(props: BlogArchiveProps) {
  return (
    <>
      <JsonLd id="blog-page" data={buildBlogArchiveJsonLd(props.page)} />
      <BlogContainer key={props.page} {...props} />
    </>
  );
}
