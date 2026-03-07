'use client';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisible?: number;
}

export function Pagination({ page, totalPages, onPageChange, maxVisible = 5 }: PaginationProps) {
  if (totalPages <= 1) return null;

  const half = Math.floor(maxVisible / 2);
  let start = Math.max(0, page - half);
  const end = Math.min(totalPages, start + maxVisible);
  if (end - start < maxVisible) {
    start = Math.max(0, end - maxVisible);
  }

  const pages = Array.from({ length: end - start }, (_, i) => start + i);

  return (
    <div className="flex justify-center items-center gap-2">
      <button
        onClick={() => onPageChange(Math.max(0, page - 1))}
        disabled={page === 0}
        className="px-3 py-2 rounded-xl bg-white border border-surface-200 text-surface-700 text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:border-surface-400 transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
            page === p
              ? 'bg-surface-900 text-white shadow-sm'
              : 'bg-white border border-surface-200 text-surface-500 hover:border-surface-400 hover:text-surface-900'
          }`}
        >
          {p + 1}
        </button>
      ))}

      <button
        onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
        disabled={page >= totalPages - 1}
        className="px-3 py-2 rounded-xl bg-white border border-surface-200 text-surface-700 text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:border-surface-400 transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
