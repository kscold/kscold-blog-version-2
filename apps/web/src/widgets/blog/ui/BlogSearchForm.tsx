'use client';

import { motion } from 'framer-motion';
import { PUBLIC_SEARCH_QUERY_MAX_LENGTH } from '@/shared/lib/search';

interface BlogSearchFormProps {
  query: string;
  onChange: (query: string) => void;
  onSubmit: () => void;
}

export function BlogSearchForm({ query, onChange, onSubmit }: BlogSearchFormProps) {
  return (
    <motion.div
      className="mb-12"
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.1, ease: [0.76, 0, 0.24, 1] }}
    >
      <form
        className="relative max-w-2xl mx-auto"
        onSubmit={event => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <BlogSearchInput query={query} onChange={onChange} />
        <button
          type="submit"
          aria-label="포스트 검색"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-900 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </form>
    </motion.div>
  );
}

function BlogSearchInput({ query, onChange }: Pick<BlogSearchFormProps, 'query' | 'onChange'>) {
  return (
    <input
      type="text"
      maxLength={PUBLIC_SEARCH_QUERY_MAX_LENGTH}
      value={query}
      onChange={event => onChange(event.target.value)}
      placeholder="포스트 검색..."
      className="w-full px-6 py-4 pr-12 bg-white border border-surface-200 rounded-2xl text-surface-900 placeholder-surface-400 shadow-sm focus:outline-none focus:ring-1 focus:ring-surface-900 focus:border-surface-900 transition-all"
    />
  );
}
