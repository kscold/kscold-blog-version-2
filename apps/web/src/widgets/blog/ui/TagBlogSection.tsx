import { PostCard } from '@/entities/post';
import type { TagArchiveData } from '../lib/loadTagArchive';
import { getTagViewPath } from '../lib/tagArchiveView';
import { ArchivePagination } from './ArchivePagination';

export function TagBlogSection({
  tag,
  initialPosts,
  page,
  basePath,
  sort,
  type,
  feedPage,
}: TagArchiveData) {
  return (
    <section aria-label="태그 블로그 목록">
      <h2 className="mb-4 text-xl font-bold text-surface-900">
        블로그 {initialPosts.totalElements}편
      </h2>
      {initialPosts.content.length ? (
        <>
          <p className="mb-6 text-sm text-surface-500">
            {page} / {initialPosts.totalPages} 페이지 ·{' '}
            {sort === 'popular' ? '조회수가 높은 순' : '최근 발행한 순'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {initialPosts.content.map(post => (
              <PostCard key={post.id} post={post} headingLevel={3} />
            ))}
          </div>
          <ArchivePagination
            showSinglePage
            basePath={getTagViewPath(basePath, { sort, type, feedPage })}
            page={page}
            totalPages={initialPosts.totalPages}
            ariaLabel={`${tag.name} 태그 페이지`}
          />
        </>
      ) : (
        <p className="py-8 text-surface-500">이 태그의 블로그 포스트가 없습니다.</p>
      )}
    </section>
  );
}
