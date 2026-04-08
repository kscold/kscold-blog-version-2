interface VaultNotePaginationProps {
  totalPages: number;
  totalElements: number;
  page: number;
  onPageChange: (page: number) => void;
}

export function VaultNotePagination({
  totalPages,
  totalElements,
  page,
  onPageChange,
}: VaultNotePaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {page * 50 + 1}-{Math.min((page + 1) * 50, totalElements)} / {totalElements}
      </p>
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={page === 0}
          className="rounded bg-gray-200 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-300 disabled:opacity-30 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          이전
        </button>
        <span className="text-sm tabular-nums text-gray-500 dark:text-gray-400">
          {page + 1}/{totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
          disabled={page >= totalPages - 1}
          className="rounded bg-gray-200 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-300 disabled:opacity-30 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          다음
        </button>
      </div>
    </div>
  );
}
