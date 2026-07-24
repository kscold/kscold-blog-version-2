'use client';

import { useState } from 'react';
import { formatDateTime, formatRelativeTime } from '@/shared/lib/format-utils';
import type { GuestbookEntry } from '@/shared/model/types/guestbook';

interface GuestbookEntryCardProps {
  entry: GuestbookEntry;
  isAdmin: boolean;
  isReplying: boolean;
  onDelete: (entryId: string) => void;
  onReply: (entryId: string, content: string) => Promise<void>;
}

export function GuestbookEntryCard({
  entry,
  isAdmin,
  isReplying,
  onDelete,
  onReply,
}: GuestbookEntryCardProps) {
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const canReply = isAdmin && !entry.reply;

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    await onReply(entry.id, replyContent.trim());
    setReplyContent('');
    setIsComposerOpen(false);
  };

  return (
    <article
      data-cy="guestbook-entry"
      className="rounded-3xl border border-surface-200 bg-surface-50 px-5 py-4 shadow-[0_8px_30px_-24px_rgba(15,23,42,0.45)]"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-surface-900">{entry.authorName}</span>
            {entry.isAdmin && (
              <span className="rounded-full bg-surface-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                Admin
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-surface-400" title={formatDateTime(entry.createdAt)}>
            {formatRelativeTime(entry.createdAt)}
          </p>
        </div>

        {entry.canDelete && (
          <button
            onClick={() => onDelete(entry.id)}
            data-cy="guestbook-delete"
            className="rounded-full border border-surface-200 px-3 py-1.5 text-xs font-semibold text-surface-500 transition-colors hover:border-red-200 hover:text-red-500"
          >
            삭제
          </button>
        )}
      </div>

      <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-surface-700">
        {entry.content}
      </p>

      {entry.reply && (
        <div className="mt-4 rounded-2xl border border-surface-800 bg-surface-900 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-surface-900">
              주인장 답글
            </span>
            <span className="text-xs text-surface-400" title={formatDateTime(entry.reply.repliedAt)}>
              {formatRelativeTime(entry.reply.repliedAt)}
            </span>
          </div>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-white">
            {entry.reply.content}
          </p>
        </div>
      )}

      {canReply && (
        <div className="mt-3">
          {isComposerOpen ? (
            <form onSubmit={handleSubmitReply} className="flex gap-2">
              <input
                type="text"
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                placeholder="답글을 입력하세요..."
                maxLength={500}
                autoFocus
                className="flex-1 rounded-xl border border-surface-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-surface-400"
              />
              <button
                type="submit"
                disabled={isReplying || !replyContent.trim()}
                className="rounded-xl bg-surface-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-surface-800 disabled:opacity-50"
              >
                {isReplying ? '...' : '등록'}
              </button>
              <button
                type="button"
                onClick={() => setIsComposerOpen(false)}
                className="rounded-xl border border-surface-200 px-3 py-2 text-xs font-semibold text-surface-500 hover:text-surface-900"
              >
                취소
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsComposerOpen(true)}
              data-cy="guestbook-reply-open"
              className="rounded-full border border-surface-200 px-3 py-1.5 text-xs font-semibold text-surface-500 transition-colors hover:border-surface-900 hover:text-surface-900"
            >
              답글 남기기
            </button>
          )}
        </div>
      )}
    </article>
  );
}
