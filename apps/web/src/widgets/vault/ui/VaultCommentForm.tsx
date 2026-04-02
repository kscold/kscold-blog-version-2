'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { UseMutationResult } from '@tanstack/react-query';
import { VaultNoteComment } from '@/types/vault';
import { useAlert } from '@/shared/model/alertStore';
import { User } from '@/types/user';

interface VaultCommentFormProps {
  currentUser: User | null;
  isAuthenticated: boolean;
  createComment: UseMutationResult<VaultNoteComment, Error, { content: string }, unknown>;
}

export function VaultCommentForm({ currentUser, isAuthenticated, createComment }: VaultCommentFormProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [content, setContent] = useState('');
  const alert = useAlert();
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

  return (
    <form onSubmit={handleSubmit} className="pt-2">
      {isAuthenticated && currentUser ? (
        <>
          <p className="mb-2 text-xs text-surface-500 font-mono">
            {currentUser.displayName} 계정으로 댓글을 작성합니다.
          </p>
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
        </>
      ) : (
        <div className="rounded-2xl border border-surface-200/50 bg-surface-50 px-4 py-3 text-sm text-surface-600">
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
  );
}
