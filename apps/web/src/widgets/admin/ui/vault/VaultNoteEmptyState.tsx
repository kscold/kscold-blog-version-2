interface VaultNoteEmptyStateProps {
  onCreate: () => void;
}

export function VaultNoteEmptyState({ onCreate }: VaultNoteEmptyStateProps) {
  return (
    <div className="rounded-lg bg-white py-20 text-center dark:bg-gray-900">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <svg
          className="h-8 w-8 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
      </div>
      <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">노트가 없습니다</h2>
      <p className="mb-6 text-gray-600 dark:text-gray-400">첫 번째 Vault 노트를 작성해보세요</p>
      <button
        onClick={onCreate}
        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 text-white transition-all hover:shadow-lg"
      >
        새 노트 작성
      </button>
    </div>
  );
}
