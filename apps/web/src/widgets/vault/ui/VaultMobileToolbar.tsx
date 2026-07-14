'use client';

interface VaultMobileToolbarProps {
  label: string;
  meta?: string;
  flush?: boolean;
  showFolderButton?: boolean;
  onOpenFolders: () => void;
  onOpenChat: () => void;
}

export function VaultMobileToolbar({
  label,
  meta,
  flush = false,
  showFolderButton = true,
  onOpenFolders,
  onOpenChat,
}: VaultMobileToolbarProps) {
  return (
    <div
      className={`lg:hidden sticky top-0 z-30 mb-5 flex items-center gap-2 border-b border-surface-200/80 bg-white/95 px-4 py-2.5 backdrop-blur-xl dark:border-surface-800 dark:bg-surface-950/95 ${flush ? '-mx-4 -mt-4 sm:-mx-6 sm:-mt-6 sm:px-6' : ''}`}
    >
      {showFolderButton && (
        <button
          type="button"
          onClick={onOpenFolders}
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-surface-200 bg-white px-3 text-xs font-bold text-surface-700 shadow-sm transition active:scale-95 dark:border-surface-800 dark:bg-surface-900 dark:text-surface-200"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 7a2 2 0 012-2h3.6a2 2 0 011.4.6L12 7h5a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
            />
          </svg>
          <span>목록</span>
        </button>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-surface-900 dark:text-white">{label}</p>
        {meta && <p className="truncate text-[11px] text-surface-400">{meta}</p>}
      </div>

      <button
        type="button"
        onClick={onOpenChat}
        aria-label="Vault Agent에게 묻기"
        className="flex h-10 shrink-0 items-center justify-center rounded-xl bg-surface-900 px-3 text-white shadow-sm transition active:scale-95 dark:bg-white dark:text-surface-900"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <span className="ml-1.5 text-xs font-bold">AI</span>
      </button>
    </div>
  );
}
