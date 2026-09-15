import { cache } from 'react';
import { notFound, permanentRedirect } from 'next/navigation';
import { fetchPublicApi } from '@/shared/lib/seo';
import { safeDecodeURIComponent } from '@/shared/lib/safeDecodeURIComponent';
import type { PageResponse } from '@/shared/model/types/api';
import type { PostSummary, TagUsage } from '@/shared/model/types/blog';
import { ARCHIVE_PAGE_SIZE, parseArchivePage } from './archivePage';
import {
  hasTagUsageSlug,
  isPostSummary,
  isRegisteredTagUsage,
  isTagUsage,
} from './archiveGuards';
import { validateArchiveResponse } from './archiveResponse';
import { getTagViewPath, type TagArchiveQuery, type TagArchiveType } from './tagArchiveView';

type RegisteredTagUsage = TagUsage & { id: string; slug: string };

export interface TagArchiveData {
  type: TagArchiveType;
  feedPage: number;
  sort: 'latest' | 'popular';
  page: number;
  basePath: string;
  tag: RegisteredTagUsage;
  initialPosts: PageResponse<PostSummary>;
}

const getTagUsage = cache(async (tagSlug: string) => {
  const tags = await fetchPublicApi<unknown>('/tags/index', 300);
  if (!Array.isArray(tags)) {
    throw new Error('태그 색인 응답이 올바르지 않습니다.');
  }
  const candidate = tags.find(item => hasTagUsageSlug(item, tagSlug));
  if (candidate === undefined) return null;
  if (!isTagUsage(candidate)) throw new Error('대상 태그 응답이 올바르지 않습니다.');
  return isRegisteredTagUsage(candidate) ? candidate : null;
});

export const loadTagArchive = cache(
  async (rawSlug: string, value: string | string[] | undefined, query: TagArchiveQuery = {}): Promise<TagArchiveData> => {
    const sortValue = query.sort;
    if (sortValue !== undefined && sortValue !== 'latest' && sortValue !== 'popular') notFound();
    if (query.type !== undefined && query.type !== 'all' && query.type !== 'blog' && query.type !== 'feed') notFound();
    const type = query.type ?? 'all';
    const feedPage = parseArchivePage(query.feedPage);
    if (feedPage === null) notFound();
    const sort = sortValue === 'popular' ? 'popular' : 'latest';
    const page = parseArchivePage(value);
    if (page === null) notFound();
    const decodedSlug = safeDecodeURIComponent(rawSlug);
    const requestedPath = `/blog/tags/${encodeURIComponent(decodedSlug)}`;
    if (value === '1') permanentRedirect(getTagViewPath(requestedPath, { sort, type, feedPage }));

    const tag = await getTagUsage(decodedSlug);
    if (!tag) notFound();
    const basePath = `/blog/tags/${encodeURIComponent(tag.slug)}`;
    const initialPosts = await fetchPublicApi<PageResponse<PostSummary>>(
      `/posts/tag/${encodeURIComponent(tag.id)}?page=${page - 1}&size=${ARCHIVE_PAGE_SIZE}&sort=${sort}`,
      300
    );
    if (initialPosts === null) throw new Error('태그 포스트를 불러올 수 없습니다.');
    if (!validateArchiveResponse(initialPosts, page, isPostSummary)) notFound();
    return { page, basePath, tag, initialPosts, sort, type, feedPage };
  }
);
