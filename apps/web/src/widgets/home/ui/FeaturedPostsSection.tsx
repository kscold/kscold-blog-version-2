import Link from 'next/link';
import { PostCard } from '@/entities/post';
import type { Post } from '@/shared/model/types/blog';
import { fetchPublicApi } from '@/shared/lib/seo';

export async function FeaturedPostsSection() {
  const featuredPosts = await fetchPublicApi<Post[]>('/posts/featured?limit=3');

  return (
    <section className="py-16 sm:py-32 px-4 sm:px-6 lg:px-8 bg-surface-50 relative border-t border-surface-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10 sm:mb-20 border-b border-surface-200 pb-6 sm:pb-8">
          <div>
            <p className="mb-3 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-surface-600">
              <span className="font-mono text-surface-600">01</span>
              <span className="h-px w-8 bg-surface-300" aria-hidden="true" />
              Featured
            </p>
            <h2 className="text-3xl sm:text-5xl font-sans font-black text-surface-900 mb-2 tracking-tight">
              Featured <span className="text-accent-dark">Posts</span>
            </h2>
            <p className="text-sm sm:text-base text-surface-500">최근 1달 기준 조회수 TOP 3</p>
          </div>
          <Link
            href="/blog"
            aria-label="블로그 전체 글 보기"
            className="group inline-flex shrink-0 items-center gap-1.5 text-surface-500 hover:text-surface-900 transition-colors uppercase text-xs sm:text-sm tracking-widest font-bold"
          >
            블로그 전체 글 보기
            <svg
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {featuredPosts && featuredPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {featuredPosts.map((post) => (
              <div key={post.id}>
                <PostCard post={post} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-surface-200 border-dashed rounded-3xl bg-white">
            <p className="text-lg text-surface-500 font-mono">작성된 포스트가 없습니다.</p>
          </div>
        )}
      </div>
    </section>
  );
}
