'use client';

import { useSearchParams, notFound } from 'next/navigation';
import { useTagIndex } from '@/entities/tag';
import { usePostsByTag } from '@/entities/post';
import { parseArchivePage } from '../lib/archivePage';
import { TagPostContainer } from './TagPostContainer';

/** 피드의 자유 태그도 등록 태그와 같은 필터·목록 UI를 사용한다. */
export function UnifiedTagContainer({ tagName }: { tagName: string }) {
  const params = useSearchParams();
  const type = params.get('type') ?? 'all';
  const sort = params.get('sort') ?? 'latest';
  const page = parseArchivePage(params.get('page') ?? undefined);
  const feedPage = parseArchivePage(params.get('feedPage') ?? undefined);
  const tags = useTagIndex();
  const tag = tags.data?.find(
    tag => tag.name.toLowerCase() === tagName.toLowerCase() || tag.slug === tagName
  );
  const posts = usePostsByTag({
    tagId: tag?.id ?? '',
    page: (page ?? 1) - 1,
    size: 12,
    sort: sort === 'popular' ? 'popular' : 'latest',
  });
  if (
    (type !== 'all' && type !== 'blog' && type !== 'feed') ||
    (sort !== 'latest' && sort !== 'popular') ||
    page === null ||
    feedPage === null
  )
    notFound();
  if (tags.isLoading || (tag?.id && posts.isLoading))
    return (
      <p role="status" className="p-12">
        태그를 불러오는 중입니다.
      </p>
    );
  if (tags.isError || (tag?.id && posts.isError))
    return (
      <div role="alert" className="p-12">
        태그를 불러오지 못했습니다.
        <button
          className="ml-3 min-h-11 underline"
          onClick={() => {
            void tags.refetch();
            if (tag?.id) void posts.refetch();
          }}
        >
          다시 시도
        </button>
      </div>
    );
  return (
    <TagPostContainer
      type={type}
      sort={sort}
      page={page}
      feedPage={feedPage}
      basePath={`/tags/${encodeURIComponent(tagName)}`}
      tag={{
        id: tag?.id ?? '',
        slug: tag?.slug ?? tagName,
        name: tag?.name ?? tagName,
        categoryId: tag?.categoryId ?? null,
        categoryName: tag?.categoryName ?? null,
        postCount: tag?.postCount ?? 0,
        feedCount: tag?.feedCount ?? 0,
        totalCount: tag?.totalCount ?? 0,
        unregistered: !tag?.id,
      }}
      initialPosts={
        posts.data ?? {
          content: [],
          number: 0,
          size: 12,
          totalElements: 0,
          totalPages: 0,
          first: true,
          last: true,
          empty: true,
        }
      }
    />
  );
}
