'use client';

import type { PostFormData } from '@/features/editor/model/types';

interface PostEditorSeoPanelProps {
  form: PostFormData;
  isOpen: boolean;
  onToggle: () => void;
  onUpdateForm: <K extends keyof PostFormData>(key: K, value: PostFormData[K]) => void;
}

export function PostEditorSeoPanel({
  form,
  isOpen,
  onToggle,
  onUpdateForm,
}: PostEditorSeoPanelProps) {
  return (
    <div className="rounded-[28px] border border-surface-200 bg-white p-5 shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-surface-400">
            SEO
          </p>
          <h3 className="mt-2 text-lg font-black tracking-tight text-surface-900">
            검색 미리보기 설정
          </h3>
        </div>
        <span className="text-sm font-semibold text-surface-400">
          {isOpen ? '접기' : '열기'}
        </span>
      </button>

      {isOpen && (
        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-surface-400">
              메타 제목
            </label>
            <input
              type="text"
              value={form.metaTitle}
              onChange={event => onUpdateForm('metaTitle', event.target.value)}
              placeholder="검색 결과에 표시될 제목"
              className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-1 focus:ring-surface-900"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-surface-400">
              메타 설명
            </label>
            <textarea
              value={form.metaDescription}
              onChange={event => onUpdateForm('metaDescription', event.target.value)}
              placeholder="검색 결과에 표시될 설명 (150자 권장)"
              rows={3}
              className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-1 focus:ring-surface-900"
            />
            <p className="mt-2 text-xs text-surface-400">{form.metaDescription.length}/160</p>
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-surface-400">
              키워드
            </label>
            <input
              type="text"
              value={form.keywords}
              onChange={event => onUpdateForm('keywords', event.target.value)}
              placeholder="React, TypeScript, 프론트엔드"
              className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-1 focus:ring-surface-900"
            />
          </div>
        </div>
      )}
    </div>
  );
}
