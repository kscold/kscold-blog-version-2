'use client';

import { useState } from 'react';
import {
  useFeedComments,
  useCreateFeedComment,
  useDeleteFeedComment,
} from '@/hooks/useFeedComments';

interface CommentSectionProps {
  feedId: string;
}

export function CommentSection({ feedId }: CommentSectionProps) {
  const [page, setPage] = useState(0);
  const { data: commentsData, isLoading } = useFeedComments(feedId, page);
  const createComment = useCreateFeedComment(feedId);
  const deleteComment = useDeleteFeedComment(feedId);

  const [authorName, setAuthorName] = useState('');
  const [authorPassword, setAuthorPassword] = useState('');
  const [content, setContent] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const comments = commentsData?.content || [];
  const totalPages = commentsData?.totalPages || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !authorPassword.trim() || !content.trim()) return;

    try {
      await createComment.mutateAsync({ authorName, authorPassword, content });
      setContent('');
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || '댓글 작성에 실패했습니다');
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!deletePassword.trim()) return;

    try {
      await deleteComment.mutateAsync({ commentId, password: deletePassword });
      setDeletingId(null);
      setDeletePassword('');
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || '삭제에 실패했습니다');
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return '방금';
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  return (
    <div className="space-y-4">
      {/* 댓글 목록 */}
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
                  <span className="text-xs text-surface-400">{formatTime(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-surface-700 mt-0.5">{comment.content}</p>
              </div>

              {deletingId === comment.id ? (
                <div className="flex items-center gap-1">
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={e => setDeletePassword(e.target.value)}
                    placeholder="비밀번호"
                    className="w-20 px-2 py-1 text-xs border border-surface-200 rounded focus:outline-none focus:ring-1 focus:ring-surface-400"
                    autoFocus
                  />
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-xs text-red-500 font-medium hover:text-red-700"
                  >
                    확인
                  </button>
                  <button
                    onClick={() => {
                      setDeletingId(null);
                      setDeletePassword('');
                    }}
                    className="text-xs text-surface-400 hover:text-surface-600"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeletingId(comment.id)}
                  className="text-xs text-surface-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  삭제
                </button>
              )}
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="text-xs text-surface-500 disabled:opacity-30"
              >
                이전
              </button>
              <span className="text-xs text-surface-400">
                {page + 1}/{totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="text-xs text-surface-500 disabled:opacity-30"
              >
                다음
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-surface-400 text-center py-4">아직 댓글이 없습니다</p>
      )}

      {/* 댓글 입력 */}
      <form onSubmit={handleSubmit} className="border-t border-surface-100 pt-4">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={authorName}
            onChange={e => setAuthorName(e.target.value)}
            placeholder="닉네임"
            maxLength={20}
            className="flex-1 px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-surface-400 bg-white"
            required
          />
          <input
            type="password"
            value={authorPassword}
            onChange={e => setAuthorPassword(e.target.value)}
            placeholder="비밀번호"
            maxLength={20}
            className="w-24 px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-surface-400 bg-white"
            required
          />
        </div>
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
      </form>
    </div>
  );
}
