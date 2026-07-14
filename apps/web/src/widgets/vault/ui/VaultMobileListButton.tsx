'use client';

interface VaultMobileListButtonProps {
  onClick: () => void;
}

export function VaultMobileListButton({ onClick }: VaultMobileListButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Vault 목록 열기"
      className="lg:hidden fixed left-4 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-surface-800 bg-surface-900 text-white shadow-xl shadow-surface-900/15 transition active:scale-95 dark:border-white dark:bg-white dark:text-surface-900"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
    >
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
}
