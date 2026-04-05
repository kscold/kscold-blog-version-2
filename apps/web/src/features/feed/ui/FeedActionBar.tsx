'use client';

import { useRef } from 'react';

interface FeedActionBarProps {
  visibility: 'PUBLIC' | 'PRIVATE';
  isUploading: boolean;
  isPending: boolean;
  isSubmitDisabled: boolean;
  contentLength: number;
  imageCount: number;
  hasLink: boolean;
  onVisibilityChange: (visibility: 'PUBLIC' | 'PRIVATE') => void;
  onImageUpload: (files: FileList) => void;
  onSubmit: () => void;
  submitLabel?: string;
}

export default function FeedActionBar({
  visibility,
  isUploading,
  isPending,
  isSubmitDisabled,
  contentLength,
  imageCount,
  hasLink,
  onVisibilityChange,
  onImageUpload,
  onSubmit,
  submitLabel = '수정하기',
}: FeedActionBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <aside data-cy="feed-editor-sidebar" className="space-y-4 xl:sticky xl:top-24 xl:self-start">
      <div className="rounded-[28px] border border-surface-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-surface-400">
          Compose
        </p>
        <h3 className="mt-3 text-xl font-black tracking-tight text-surface-900">피드 설정</h3>
        <p className="mt-2 text-sm leading-relaxed text-surface-500">
          짧은 문장, 이미지, 링크를 한 번에 정리해서 바로 게시할 수 있습니다.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-surface-200 bg-surface-50 px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-surface-400">
              Text
            </p>
            <p className="mt-2 text-xl font-black tracking-tight text-surface-900">
              {contentLength}
            </p>
          </div>
          <div className="rounded-2xl border border-surface-200 bg-surface-50 px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-surface-400">
              Image
            </p>
            <p className="mt-2 text-xl font-black tracking-tight text-surface-900">
              {imageCount}
            </p>
          </div>
          <div className="rounded-2xl border border-surface-200 bg-surface-50 px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-surface-400">
              Link
            </p>
            <p className="mt-2 text-xl font-black tracking-tight text-surface-900">
              {hasLink ? 'ON' : 'OFF'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          data-cy="feed-editor-upload"
          disabled={isUploading}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-surface-200 bg-surface-50 px-4 py-3 text-sm font-semibold text-surface-700 transition-colors hover:bg-surface-100 hover:text-surface-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
          onChange={e => e.target.files && onImageUpload(e.target.files)}
          className="hidden"
          data-cy="feed-editor-upload-input"
        />

        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-surface-400">
            Visibility
          </p>
          <div
            data-cy="feed-editor-visibility"
            className="inline-flex w-full rounded-full border border-surface-200 bg-surface-50 p-1"
          >
            {(['PUBLIC', 'PRIVATE'] as const).map(option => (
              <button
                key={option}
                type="button"
                onClick={() => onVisibilityChange(option)}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  visibility === option
                    ? 'bg-surface-900 text-white'
                    : 'text-surface-500 hover:text-surface-900'
                }`}
              >
                {option === 'PUBLIC' ? '공개' : '비공개'}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-surface-500">
            {visibility === 'PUBLIC'
              ? '블로그 피드 목록에 바로 노출됩니다.'
              : '관리자 화면에서만 확인할 수 있는 메모로 저장됩니다.'}
          </p>
        </div>
      </div>

      <div className="rounded-[28px] border border-surface-200 bg-surface-900 p-5 text-white shadow-[0_20px_50px_rgba(15,23,42,0.14)]">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">Ready</p>
        <h3 className="mt-3 text-xl font-black tracking-tight">지금 상태로 저장합니다</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/70">
          문장을 조금만 적어도 괜찮아요. 이미지나 링크와 함께 지금의 흐름을 편하게 남겨
          주세요.
        </p>
        <button
          type="button"
          onClick={onSubmit}
          data-cy="feed-editor-submit"
          disabled={isPending || isSubmitDisabled}
          className="mt-5 w-full rounded-full bg-white px-6 py-3 font-semibold text-surface-900 transition-colors hover:bg-surface-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? '저장 중...' : submitLabel}
        </button>
      </div>
    </aside>
  );
}
