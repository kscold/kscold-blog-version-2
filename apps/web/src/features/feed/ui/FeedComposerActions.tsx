interface FeedComposerActionsProps {
  hasDraft: boolean;
  isUploading: boolean;
  isSubmitting: boolean;
  canSubmit: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onUploadFiles: (files: FileList) => Promise<void>;
  onToggleExpanded: () => void;
  onReset: () => void;
  onSubmit: () => Promise<void>;
  shouldShowExpanded: boolean;
}

export function FeedComposerActions({
  hasDraft,
  isUploading,
  isSubmitting,
  canSubmit,
  fileInputRef,
  onUploadFiles,
  onToggleExpanded,
  onReset,
  onSubmit,
  shouldShowExpanded,
}: FeedComposerActionsProps) {
  return (
    <div className="flex flex-col gap-3 rounded-[28px] border border-surface-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          data-cy="feed-composer-upload"
          disabled={isUploading}
          className="inline-flex items-center gap-2 rounded-full border border-surface-200 bg-surface-50 px-4 py-2 text-sm font-semibold text-surface-700 transition-colors hover:bg-surface-100 hover:text-surface-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z"
            />
          </svg>
          {isUploading ? '이미지 업로드 중...' : '이미지 추가'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={event => event.target.files && void onUploadFiles(event.target.files)}
          className="hidden"
          data-cy="feed-composer-upload-input"
        />

        <button
          type="button"
          onClick={onToggleExpanded}
          data-cy="feed-composer-toggle"
          className="inline-flex items-center gap-2 rounded-full border border-surface-200 bg-white px-4 py-2 text-sm font-semibold text-surface-500 transition-colors hover:text-surface-900"
        >
          {shouldShowExpanded ? '보조 패널 접기' : '링크와 이미지 패널 열기'}
        </button>

        {hasDraft ? (
          <button
            type="button"
            onClick={onReset}
            data-cy="feed-composer-reset"
            className="inline-flex items-center gap-2 rounded-full border border-surface-200 bg-white px-4 py-2 text-sm font-semibold text-surface-400 transition-colors hover:text-surface-700"
          >
            초안 비우기
          </button>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => void onSubmit()}
        data-cy="feed-composer-submit"
        disabled={isSubmitting || !canSubmit}
        className="inline-flex items-center justify-center rounded-full bg-surface-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-surface-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? '게시 중...' : '피드 게시하기'}
      </button>
    </div>
  );
}
