'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { useFeedComments, useMentionableUsers } from '@/entities/feed';
import {
  useCreateFeedComment,
  useDeleteFeedComment,
  useToggleFeedCommentLike,
} from '@/features/feed';
import { useAlert } from '@/shared/model/alertStore';
import { formatRelativeTime } from '@/shared/lib/format-utils';
import { Pagination } from '@/shared/ui/Pagination';
import { LinkifiedText } from '@/shared/ui/LinkifiedText';
import { usePerformanceMode } from '@/shared/model/usePerformanceMode';
import { useAuth } from '@/features/auth';
import { CommentComposer } from './CommentComposer';

interface CommentSectionProps {
  feedId: string;
}

export function CommentSection({ feedId }: CommentSectionProps) {
  const [page, setPage] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { data: commentsData, isLoading } = useFeedComments(feedId, page);
  const { data: mentionable } = useMentionableUsers(feedId);
  const createComment = useCreateFeedComment(feedId);
  const deleteComment = useDeleteFeedComment(feedId);
  const toggleCommentLike = useToggleFeedCommentLike(feedId);
  const { reduceMotion } = usePerformanceMode();
  const { currentUser, isAuthenticated } = useAuth();
  const alert = useAlert();
  const [content, setContent] = useState('');

  const comments = commentsData?.content || [];
  const totalPages = commentsData?.totalPages || 0;
  const redirect = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`;

  // 렌더링용 멘션 맵: 표시 이름과 아이디 모두 프로필 주소로 연결함.
  const mentionMap = useMemo(
    () =>
      Object.fromEntries(
        (mentionable ?? []).flatMap(user => [
          [user.displayName, user.username],
          [user.username, user.username],
        ])
      ),
    [mentionable]
  );

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      await createComment.mutateAsync({ content });
      setContent('');
      // 새 댓글 작성자가 이후 멘션 대상에 포함되도록 갱신
      queryClient.invalidateQueries({ queryKey: ['feed-mentionable-users', feedId] });
    } catch (err) {
      const message = err instanceof Error ? err.message : '댓글 작성에 실패했습니다';
      alert.error(message);
    }
  };

  const handleToggleLike = async (commentId: string) => {
    try {
      await toggleCommentLike.mutateAsync(commentId);
    } catch (err) {
      const message = err instanceof Error ? err.message : '좋아요를 반영하지 못했습니다';
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
                  <span className="text-xs text-surface-600">
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                  <button
                    type="button"
                    aria-label={`${comment.isLiked ? '댓글 좋아요 취소' : '댓글 좋아요'}${comment.likesCount > 0 ? ` ${comment.likesCount}개` : ''}`}
                    aria-pressed={comment.isLiked}
                    onClick={() => handleToggleLike(comment.id)}
                    className={`ml-1 flex items-center gap-1 text-xs font-bold transition-colors ${
                      comment.isLiked
                        ? 'text-red-500'
                        : 'text-surface-600 hover:text-surface-900'
                    }`}
                  >
                    <motion.svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill={comment.isLiked ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth={2}
                      whileTap={reduceMotion ? undefined : { scale: 1.2 }}
                      transition={
                        reduceMotion ? undefined : { type: 'spring', stiffness: 500, damping: 15 }
                      }
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                      />
                    </motion.svg>
                    {comment.likesCount > 0 && <span>{comment.likesCount}</span>}
                  </button>
                </div>
                <LinkifiedText
                  text={comment.content}
                  mentions={mentionMap}
                  className="text-sm text-surface-700 mt-1 whitespace-pre-wrap break-words"
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

      <div className="border-t border-surface-100 pt-4">
        {isAuthenticated && currentUser ? (
          <CommentComposer
            value={content}
            onChange={setContent}
            onSubmit={handleSubmit}
            isPending={createComment.isPending}
            currentUserName={currentUser.displayName}
            currentUsername={currentUser.username}
            mentionable={mentionable ?? []}
          />
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
      </div>
    </div>
  );
}
