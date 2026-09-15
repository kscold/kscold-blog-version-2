'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFeeds } from '@/entities/feed';
import { FeedCard } from '@/features/feed';
import { Pagination } from '@/shared/ui/Pagination';
import { usePaginationScroll } from '@/shared/model/usePaginationScroll';
import type { TagArchiveData } from '../lib/loadTagArchive';
import { getTagViewPath } from '../lib/tagArchiveView';
import { getArchivePagePath } from '../lib/archivePage';

export function TagFeedSection({ tag, feedPage, sort, type, basePath, page: blogPage }: TagArchiveData) {
  const router = useRouter();
  const query = useFeeds({ tag: tag.name, page: feedPage - 1, size: 12, sort });
  const navigate = usePaginationScroll(feedPage - 1, query.isLoading);
  const changePage = (page: number) =>
    navigate(page, value => {
      router.push(getArchivePagePath(getTagViewPath(basePath, { sort, type, feedPage: value + 1 }), blogPage), { scroll: false });
    });
  return (
    <section aria-label="태그 피드 목록" className="mt-12">
      <h2 className="mb-4 text-xl font-bold text-surface-900">
        피드 {query.data?.totalElements ?? tag.feedCount}개
      </h2>
      {query.isLoading ? (
        <p role="status" className="py-12 text-surface-500">
          피드를 불러오는 중입니다.
        </p>
      ) : query.isError ? (
        <div role="alert" className="py-12 text-surface-600">
          피드를 불러오지 못했습니다.
          <button onClick={() => void query.refetch()} className="ml-3 min-h-11 underline">
            다시 시도
          </button>
        </div>
      ) : (
        <TagFeedResults
          data={query.data}
          page={feedPage}
          changePage={changePage}
          firstPath={getArchivePagePath(getTagViewPath(basePath, { sort, type }), blogPage)}
        />
      )}
    </section>
  );
}

function TagFeedResults({
  data,
  page,
  changePage,
  firstPath,
}: {
  data: ReturnType<typeof useFeeds>['data'];
  page: number;
  changePage: (page: number) => void;
  firstPath: string;
}) {
  if (!data?.content.length)
    return (
      <p className="py-12 text-surface-500">
        {page > 1 ? (
          <>
            이 페이지에는 피드가 없습니다.{' '}
            <Link href={firstPath} className="underline">
              첫 페이지로 이동
            </Link>
          </>
        ) : (
          '이 태그의 공개 피드가 없습니다.'
        )}
      </p>
    );
  return (
    <>
      <p className="mb-6 text-sm text-surface-500">
        {page} / {data.totalPages} 페이지
      </p>
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {data.content.map(feed => (
          <FeedCard
            key={feed.id}
            feed={feed}
            imageSizes="(max-width: 1023px) calc(100vw - 2rem), 596px"
          />
        ))}
      </div>
      <Pagination page={page - 1} totalPages={data.totalPages} onPageChange={changePage} />
    </>
  );
}
