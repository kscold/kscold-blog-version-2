'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/api/useAuth';
import {
  useVaultComments,
  useCreateVaultComment,
  useDeleteVaultComment,
} from '@/entities/vault/api/useVaultComments';
import { VaultCommentItem } from './VaultCommentItem';
import { VaultCommentForm } from './VaultCommentForm';
import { useAlert } from '@/shared/model/alertStore';
import { formatRelativeTime } from '@/shared/lib/format-utils';

interface VaultCommentSectionProps {
  noteId: string;
}

export function VaultCommentSection({ noteId }: VaultCommentSectionProps) {
  const [page, setPage] = useState(0);
  const { data: commentsData, isLoading } = useVaultComments(noteId, page);
  const createComment = useCreateVaultComment(noteId);
  const deleteComment = useDeleteVaultComment(noteId);
  const { currentUser, isAuthenticated } = useAuth();
  const alert = useAlert();

  const comments = commentsData?.content || [];
  const totalPages = commentsData?.totalPages || 0;

  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment.mutateAsync(commentId);
    } catch (err) {
      const message = err instanceof Error ? err.message : '삭제에 실패했습니다';
      alert.error(message);
    }
  };

  return (
    <div className="space-y-4 pt-12 border-t border-surface-200/50 mt-16">
      <h3 className="text-sm font-bold text-surface-400 uppercase tracking-widest mb-6 flex items-center gap-2">
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        Neural Network Synapse Link Formed
      </h3>

      {/* 댓글 목록 */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-surface-100 rounded animate-pulse" />
          ))}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map(comment => (
            <VaultCommentItem
              key={comment.id}
              comment={comment}
              onDelete={handleDelete}
              formatTime={formatRelativeTime}
            />
          ))}

          {totalPages > 1 && (
            <div className="flex justify-center gap-3 pt-4">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="text-xs text-surface-500 font-mono disabled:opacity-30 hover:text-accent-light transition-colors"
              >
                prev
              </button>
              <span className="text-xs text-surface-600 font-mono tabular-nums">
                {page + 1}/{totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="text-xs text-surface-500 font-mono disabled:opacity-30 hover:text-accent-light transition-colors"
              >
                next
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-surface-500 text-center py-8 font-mono bg-surface-50 rounded-2xl border border-surface-200/50">
          No comm links active yet
        </p>
      )}

      {/* 댓글 입력 폼 */}
      <VaultCommentForm
        currentUser={currentUser ?? null}
        isAuthenticated={isAuthenticated}
        createComment={createComment}
      />
    </div>
  );
}
