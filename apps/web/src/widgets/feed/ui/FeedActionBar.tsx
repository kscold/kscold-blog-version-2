'use client';

import { useRef } from 'react';

interface FeedActionBarProps {
  visibility: 'PUBLIC' | 'PRIVATE';
  isUploading: boolean;
  isPending: boolean;
  isSubmitDisabled: boolean;
  onToggleVisibility: () => void;
  onImageUpload: (files: FileList) => void;
  onSubmit: () => void;
}

export default function FeedActionBar({
  visibility,
  isUploading,
  isPending,
  isSubmitDisabled,
  onToggleVisibility,
  onImageUpload,
  onSubmit,
}: FeedActionBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-surface-100">
      <div className="flex items-center gap-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z"
            />
          </svg>
          {isUploading ? '업로드 중...' : '사진'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={e => e.target.files && onImageUpload(e.target.files)}
          className="hidden"
        />

        <button
          onClick={onToggleVisibility}
          className="flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-900 transition-colors"
        >
          {visibility === 'PUBLIC' ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
              />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          )}
          {visibility === 'PUBLIC' ? '공개' : '비공개'}
        </button>
      </div>

      <button
        onClick={onSubmit}
        disabled={isPending || isSubmitDisabled}
        className="px-6 py-2 bg-surface-900 text-white text-sm font-bold rounded-xl hover:bg-surface-800 disabled:opacity-50 transition-colors"
      >
        {isPending ? '저장 중...' : '수정하기'}
      </button>
    </div>
  );
}
