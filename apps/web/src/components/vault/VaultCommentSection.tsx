'use client';

import { useState } from 'react';
import {
  useVaultComments,
  useCreateVaultComment,
  useDeleteVaultComment,
} from '@/hooks/useVaultComments';

interface VaultCommentSectionProps {
  noteId: string;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString('ko-KR');
}

export function VaultCommentSection({ noteId }: VaultCommentSectionProps) {
  const [page, setPage] = useState(0);
  const { data: commentsData, isLoading } = useVaultComments(noteId, page);
  const createComment = useCreateVaultComment(noteId);
  const deleteComment = useDeleteVaultComment(noteId);

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

  return (
    <div className="space-y-4">
      {/* Comment List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />
          ))}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map(comment => (
            <div
              key={comment.id}
              className="flex gap-3 group p-3 rounded border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-200 font-mono">
                    {comment.authorName}
                  </span>
                  {comment.isAdmin && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-violet-500/20 text-violet-300 rounded-sm font-mono font-bold border border-violet-500/30">
                      ADMIN
                    </span>
                  )}
                  <span className="text-[11px] text-gray-600 font-mono">
                    {formatTime(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-1">{comment.content}</p>
              </div>

              {deletingId === comment.id ? (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={e => setDeletePassword(e.target.value)}
                    placeholder="PW"
                    className="w-16 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded text-gray-300 placeholder-gray-600 focus:outline-none focus:border-violet-500/50 font-mono"
                    autoFocus
                  />
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-xs text-red-400 font-mono hover:text-red-300"
                  >
                    OK
                  </button>
                  <button
                    onClick={() => {
                      setDeletingId(null);
                      setDeletePassword('');
                    }}
                    className="text-xs text-gray-600 font-mono hover:text-gray-400"
                  >
                    X
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeletingId(comment.id)}
                  className="text-xs text-gray-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all font-mono flex-shrink-0"
                >
                  DEL
                </button>
              )}
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="text-xs text-gray-500 font-mono disabled:opacity-30 hover:text-cyan-400 transition-colors"
              >
                prev
              </button>
              <span className="text-xs text-gray-600 font-mono tabular-nums">
                {page + 1}/{totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="text-xs text-gray-500 font-mono disabled:opacity-30 hover:text-cyan-400 transition-colors"
              >
                next
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-600 text-center py-6 font-mono">No comments yet</p>
      )}

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="border-t border-white/5 pt-4">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={authorName}
            onChange={e => setAuthorName(e.target.value)}
            placeholder="Nickname"
            maxLength={20}
            className="flex-1 px-3 py-2 text-sm bg-white/5 border border-white/10 rounded text-gray-300 placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 font-mono"
            required
          />
          <input
            type="password"
            value={authorPassword}
            onChange={e => setAuthorPassword(e.target.value)}
            placeholder="Password"
            maxLength={20}
            className="w-28 px-3 py-2 text-sm bg-white/5 border border-white/10 rounded text-gray-300 placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 font-mono"
            required
          />
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write a comment..."
            maxLength={500}
            className="flex-1 px-3 py-2 text-sm bg-white/5 border border-white/10 rounded text-gray-300 placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 font-mono"
            required
          />
          <button
            type="submit"
            disabled={createComment.isPending}
            className="px-4 py-2 bg-violet-600/80 text-white text-sm font-mono rounded hover:bg-violet-500 disabled:opacity-50 transition-colors border border-violet-500/30"
          >
            {createComment.isPending ? '...' : 'POST'}
          </button>
        </div>
      </form>
    </div>
  );
}
