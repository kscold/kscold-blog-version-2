'use client';

interface VaultGraphZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomToFit: () => void;
}

// 줌 컨트롤 — 모바일에선 폴더 FAB와 겹치지 않게 위로, 데스크톱에선 챗 버튼 왼쪽에 나란히
export function VaultGraphZoomControls({
  onZoomIn,
  onZoomOut,
  onZoomToFit,
}: VaultGraphZoomControlsProps) {
  return (
    <div className="absolute bottom-[5.5rem] left-4 lg:bottom-4 lg:left-auto lg:right-24 z-10 flex flex-col overflow-hidden rounded-2xl border border-surface-200/70 dark:border-surface-700/70 bg-white/80 dark:bg-surface-900/80 shadow-sm backdrop-blur-md">
      <button
        type="button"
        onClick={onZoomIn}
        aria-label="확대"
        className="flex h-10 w-10 items-center justify-center text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-900 dark:hover:bg-surface-800 dark:hover:text-white active:bg-surface-200/70"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
      <div className="h-px bg-surface-200/70 dark:bg-surface-700/70" />
      <button
        type="button"
        onClick={onZoomOut}
        aria-label="축소"
        className="flex h-10 w-10 items-center justify-center text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-900 dark:hover:bg-surface-800 dark:hover:text-white active:bg-surface-200/70"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15" />
        </svg>
      </button>
      <div className="h-px bg-surface-200/70 dark:bg-surface-700/70" />
      <button
        type="button"
        onClick={onZoomToFit}
        aria-label="전체 보기"
        className="flex h-10 w-10 items-center justify-center text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-900 dark:hover:bg-surface-800 dark:hover:text-white active:bg-surface-200/70"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 9V5.25A1.5 1.5 0 015.25 3.75H9m6 0h3.75a1.5 1.5 0 011.5 1.5V9m0 6v3.75a1.5 1.5 0 01-1.5 1.5H15m-6 0H5.25a1.5 1.5 0 01-1.5-1.5V15"
          />
        </svg>
      </button>
    </div>
  );
}
