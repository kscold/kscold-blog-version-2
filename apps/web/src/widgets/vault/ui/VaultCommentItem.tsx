'use client';

import { useState } from 'react';
import { VaultNoteComment } from '@/types/vault';

interface VaultCommentItemProps {
  comment: VaultNoteComment;
  onDelete: (commentId: string, password: string) => Promise<void>;
  formatTime: (dateStr: string) => string;
}

export function VaultCommentItem({ comment, onDelete, formatTime }: VaultCommentItemProps) {
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deletePassword.trim()) return;
    await onDelete(comment.id, deletePassword);
    setIsDeleting(false);
    setDeletePassword('');
  };

  return (
    <div
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

      {isDeleting ? (
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
            onClick={handleDelete}
            className="text-xs text-red-400 font-mono hover:text-red-300"
          >
            OK
          </button>
          <button
            onClick={() => {
              setIsDeleting(false);
              setDeletePassword('');
            }}
            className="text-xs text-surface-500 font-mono hover:text-surface-700"
          >
            X
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsDeleting(true)}
          className="text-xs text-surface-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all font-mono flex-shrink-0"
        >
          DEL
        </button>
      )}
    </div>
  );
}
