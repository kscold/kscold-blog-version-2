'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useVaultSemanticSearch } from '@/entities/vault';

interface VaultSemanticSearchProps {
  activeFolderName: string;
  onNavigate: () => void;
}

export function VaultSemanticSearch({ activeFolderName, onNavigate }: VaultSemanticSearchProps) {
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const { data = [], isFetching, isError } = useVaultSemanticSearch(query, activeFolderName);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = input.trim();
    if (normalized.length >= 2) setQuery(normalized);
  };

  return (
    <section
      aria-label="Vault 의미 검색"
      className="border-b border-surface-200/70 pb-5 dark:border-surface-800"
    >
      <form onSubmit={handleSubmit} className="relative">
        <label htmlFor="vault-semantic-search" className="sr-only">
          Vault 문서 검색
        </label>
        <input
          id="vault-semantic-search"
          value={input}
          onChange={event => setInput(event.target.value)}
          placeholder="의미로 문서 찾기"
          className="h-10 w-full rounded-xl border border-surface-200 bg-surface-50 px-3 pr-10 text-sm text-surface-900 outline-none transition focus:border-accent dark:border-surface-700 dark:bg-surface-950 dark:text-white"
        />
        <button
          type="submit"
          aria-label="문서 검색"
          disabled={input.trim().length < 2 || isFetching}
          className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-lg text-surface-500 transition hover:bg-surface-200 disabled:opacity-40 dark:hover:bg-surface-800"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </button>
      </form>

      {query && (
        <div className="mt-3 space-y-2" aria-live="polite">
          {isFetching && (
            <p className="px-1 text-xs text-surface-400">관련 기록을 찾는 중입니다.</p>
          )}
          {isError && <p className="px-1 text-xs text-red-500">검색 연결을 확인해 주세요.</p>}
          {!isFetching && !isError && data.length === 0 && (
            <p className="px-1 text-xs text-surface-400">가까운 기록을 찾지 못했습니다.</p>
          )}
          {data.map(result => (
            <Link
              key={result.id}
              href={result.path || `/vault/${result.slug}`}
              onClick={onNavigate}
              className="block rounded-xl border border-surface-200/70 bg-white p-3 transition hover:border-accent/50 hover:bg-surface-50 dark:border-surface-800 dark:bg-surface-900 dark:hover:bg-surface-800"
            >
              <strong className="block truncate text-sm text-surface-900 dark:text-white">
                {result.title}
              </strong>
              <span className="mt-1 line-clamp-2 text-xs leading-5 text-surface-500 dark:text-surface-400">
                {result.excerpt}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
