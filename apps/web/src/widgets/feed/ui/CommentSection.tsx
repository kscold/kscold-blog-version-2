'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  useFeedComments,
  useCreateFeedComment,
  useDeleteFeedComment,
} from '@/entities/feed/api/useFeedComments';
import { useAlert } from '@/shared/model/alertStore';
import { formatRelativeTime } from '@/shared/lib/format-utils';
import { Pagination } from '@/shared/ui/Pagination';
import { LinkifiedText } from '@/shared/ui/LinkifiedText';
import { useAuth } from '@/features/auth/api/useAuth';

interface CommentSectionProps {
  feedId: string;
}

export function CommentSection({ feedId }: CommentSectionProps) {
  const [page, setPage] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: commentsData, isLoading } = useFeedComments(feedId, page);
  const createComment = useCreateFeedComment(feedId);
  const deleteComment = useDeleteFeedComment(feedId);
  const { currentUser, isAuthenticated } = useAuth();
  const alert = useAlert();
  const [content, setContent] = useState('');

  const comments = commentsData?.content || [];
  const totalPages = commentsData?.totalPages || 0;
  const redirect = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await createComment.mutateAsync({ content });
      setContent('');
    } catch (err) {
      const message = err instanceof Error ? err.message : '댓글 작성에 실패했습니다';
      alert.error(message);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment.mutateAsync(commentId);
    } catch (err) {
      const message = err instanceof Error ? err.message : '삭제에 실패했습니다';
      alert.error(message);
    }
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-surface-50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3 group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-surface-900">{comment.authorName}</span>
                  {comment.isAdmin && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-surface-900 text-white rounded font-bold">
                      ADMIN
                    </span>
                  )}
                  <span className="text-xs text-surface-400">{formatRelativeTime(comment.createdAt)}</span>
                </div>
                <LinkifiedText
                  text={comment.content}
                  className="text-sm text-surface-700 mt-0.5 whitespace-pre-wrap break-words"
                />

              </div>

              {comment.canDelete && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-xs text-surface-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  삭제
                </button>
              )}
            </div>
          ))}

          <div className="pt-2">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      ) : (
        <p className="text-sm text-surface-400 text-center py-4">아직 댓글이 없습니다</p>
      )}

      <form onSubmit={handleSubmit} className="border-t border-surface-100 pt-4">
        {isAuthenticated && currentUser ? (
          <>
            <p className="mb-2 text-xs text-surface-500">
              <span className="font-semibold text-surface-700">{currentUser.displayName}</span> 계정으로 댓글을 남깁니다.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="댓글을 입력하세요..."
                maxLength={500}
                className="flex-1 px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-surface-400 bg-white"
                required
              />
              <button
                type="submit"
                disabled={createComment.isPending}
                className="px-4 py-2 bg-surface-900 text-white text-sm font-bold rounded-lg hover:bg-surface-800 disabled:opacity-50 transition-colors"
              >
                {createComment.isPending ? '...' : '게시'}
              </button>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-surface-600">
            댓글은 로그인 후 작성할 수 있습니다.
            <Link
              href={`/login?redirect=${encodeURIComponent(redirect)}`}
              className="ml-2 font-semibold text-surface-900 underline underline-offset-2"
            >
              로그인하러 가기
            </Link>
          </div>
        )}
      </form>
    </div>
  );
}
