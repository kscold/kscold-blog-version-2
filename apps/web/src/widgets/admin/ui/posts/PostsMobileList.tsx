'use client';

import Link from 'next/link';
import { Post } from '@/shared/model/types/blog';
import { PostStatusBadge } from './PostStatusBadge';
import { getPostViewHref } from './postLinks';

interface PostsMobileListProps {
  posts: Post[];
  onDelete: (id: string, title: string) => void;
}

const ACTION = 'rounded-lg px-3 py-1.5 text-xs font-bold transition-colors';

/** 좁은 화면에서는 표 대신 글마다 카드 한 장으로 보여준다. */
export function PostsMobileList({ posts, onDelete }: PostsMobileListProps) {
  return (
    <div className="space-y-3 sm:hidden">
      {posts.map(post => (
        <div key={post.id} className="rounded-2xl border border-surface-200 bg-white p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-bold text-surface-900">{post.title}</p>
              <p className="mt-0.5 truncate text-xs text-surface-400">
                {post.category.icon && <span className="mr-1">{post.category.icon}</span>}
                {post.category.name}
              </p>
            </div>
            <PostStatusBadge status={post.status} />
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="text-xs text-surface-400">
              조회 {post.views} · {new Date(post.createdAt).toLocaleDateString('ko-KR')}
            </span>
            <div className="flex gap-1">
              <Link
                href={getPostViewHref(post)}
                target="_blank"
                className={`${ACTION} bg-surface-100 text-surface-600 hover:bg-surface-200`}
              >
                보기
              </Link>
              <Link
                href={`/admin/posts/${post.id}/edit`}
                className={`${ACTION} bg-surface-900 text-white hover:bg-surface-800`}
              >
                수정
              </Link>
              <button
                type="button"
                onClick={() => onDelete(post.id, post.title)}
                className={`${ACTION} bg-red-50 text-red-600 hover:bg-red-100`}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
