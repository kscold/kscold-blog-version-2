import Link from 'next/link';
import type { Post } from '@/shared/model/types/blog';
import { PostStatusBadge } from '../posts/PostStatusBadge';

export function DashboardRecentPosts({ posts }: { posts: Post[] }) {
  return (
    <section aria-labelledby="dashboard-recent-posts-title" className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 id="dashboard-recent-posts-title" className="text-lg font-black text-surface-900">
          최근 포스트
        </h2>
        <Link
          href="/admin/posts"
          className="text-sm font-bold text-surface-500 transition-colors hover:text-surface-900"
        >
          전체 보기
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-3xl border border-surface-200 bg-white py-12 text-center">
          <p className="text-sm text-surface-500">아직 포스트가 없습니다.</p>
        </div>
      ) : (
        <ul className="divide-y divide-surface-100 overflow-hidden rounded-3xl border border-surface-200 bg-white">
          {posts.map(post => (
            <li key={post.id}>
              <Link
                href={`/admin/posts/${post.id}/edit`}
                className="flex items-start justify-between gap-3 p-4 transition-colors hover:bg-surface-50"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold leading-5 text-surface-900 [overflow-wrap:anywhere]">
                    {post.title}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-5 text-surface-500">
                    {post.category && <span>{post.category.name}</span>}
                    <span>조회 {post.views}</span>
                    <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
                  </span>
                </span>
                <PostStatusBadge status={post.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
