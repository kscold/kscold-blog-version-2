'use client';

import { useState } from 'react';
import { UseMutationResult } from '@tanstack/react-query';

interface VaultCommentFormProps {
  createComment: UseMutationResult<any, any, { authorName: string; authorPassword: string; content: string }, any>;
}

export function VaultCommentForm({ createComment }: VaultCommentFormProps) {
  const [authorName, setAuthorName] = useState('');
  const [authorPassword, setAuthorPassword] = useState('');
  const [content, setContent] = useState('');

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

  return (
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
  );
}
