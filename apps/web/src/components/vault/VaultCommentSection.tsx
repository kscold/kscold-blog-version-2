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
    <div className="space-y-4 pt-12 border-t border-surface-200/50 mt-16">
      <h3 className="text-sm font-bold text-surface-400 uppercase tracking-widest mb-6 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Neural Network Synapse Link Formed
      </h3>
      {/* Comment List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-surface-100 rounded animate-pulse" />
          ))}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map(comment => (
            <div
              key={comment.id}
              className="flex gap-3 group p-4 rounded-2xl border border-surface-200/50 bg-white hover:bg-surface-50 transition-colors shadow-sm"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-surface-900 font-mono">
                    {comment.authorName}
                  </span>
                  {comment.isAdmin && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-violet-100 text-violet-700 rounded-sm font-mono font-bold border border-violet-200">
                      ADMIN
                    </span>
                  )}
                  <span className="text-[11px] text-surface-500 font-mono">
                    {formatTime(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-surface-700 mt-1.5 leading-relaxed">{comment.content}</p>
              </div>

              {deletingId === comment.id ? (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={e => setDeletePassword(e.target.value)}
                    placeholder="PW"
                    className="w-16 px-2 py-1 text-xs bg-surface-50 border border-surface-200 rounded-lg text-surface-900 placeholder-surface-400 focus:outline-none focus:border-violet-500/50 font-mono"
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
                    className="text-xs text-surface-500 font-mono hover:text-surface-700"
                  >
                    X
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeletingId(comment.id)}
                  className="text-xs text-surface-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all font-mono flex-shrink-0"
                >
                  DEL
                </button>
              )}
            </div>
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
        <p className="text-xs text-surface-500 text-center py-8 font-mono bg-surface-50 rounded-2xl border border-surface-200/50">No comm links active yet</p>
      )}

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="pt-2">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={authorName}
            onChange={e => setAuthorName(e.target.value)}
            placeholder="Nickname"
            maxLength={20}
            className="flex-1 px-4 py-2.5 text-sm bg-white border border-surface-200 rounded-xl text-surface-900 placeholder-surface-400 focus:outline-none focus:border-accent-light focus:ring-1 focus:ring-accent-light transition-all font-mono shadow-sm"
            required
          />
          <input
            type="password"
            value={authorPassword}
            onChange={e => setAuthorPassword(e.target.value)}
            placeholder="Password"
            maxLength={20}
            className="w-32 px-4 py-2.5 text-sm bg-white border border-surface-200 rounded-xl text-surface-900 placeholder-surface-400 focus:outline-none focus:border-accent-light focus:ring-1 focus:ring-accent-light transition-all font-mono shadow-sm"
            required
          />
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Initialize synapse link..."
            maxLength={500}
            className="flex-1 px-4 py-2.5 text-sm bg-white border border-surface-200 rounded-xl text-surface-900 placeholder-surface-400 focus:outline-none focus:border-accent-light focus:ring-1 focus:ring-accent-light transition-all font-mono shadow-sm"
            required
          />
          <button
            type="submit"
            disabled={createComment.isPending}
            className="px-6 py-2.5 bg-surface-900 text-white text-sm font-bold rounded-xl hover:bg-surface-800 disabled:opacity-50 transition-all font-mono shadow-sm"
          >
            {createComment.isPending ? '...' : 'POST'}
          </button>
        </div>
      </form>
    </div>
  );
}
