'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TagSelector } from '@/features/editor/ui/TagSelector';
import type { PostFormData } from '@/features/editor/model/types';

interface Category {
  id: string;
  name: string;
  depth: number;
  icon?: string;
}

interface PostEditorSidebarProps {
  mode: 'create' | 'edit';
  form: PostFormData;
  categories: Category[] | undefined;
  isSubmitting: boolean;
  lastSavedText: string | null;
  onUpdateForm: <K extends keyof PostFormData>(key: K, value: PostFormData[K]) => void;
}

export function PostEditorSidebar({
  mode,
  form,
  categories,
  isSubmitting,
  lastSavedText,
  onUpdateForm,
}: PostEditorSidebarProps) {
  const router = useRouter();
  const [showSeo, setShowSeo] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <aside data-cy="post-editor-sidebar" className="space-y-4 xl:sticky xl:top-24 xl:self-start">
      <div className="rounded-[28px] border border-surface-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-surface-400">
          Publish
        </p>
        <h3 className="mt-3 text-xl font-black tracking-tight text-surface-900">
          문서 설정
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-surface-500">
          발행 상태와 카테고리, 태그를 먼저 잡아두면 문서 정리가 훨씬 편합니다.
        </p>

        <div className="mt-5 space-y-5">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-surface-400">
              상태
            </label>
            <select
              value={form.status}
              onChange={e => onUpdateForm('status', e.target.value as PostFormData['status'])}
              data-cy="post-editor-status"
              className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-surface-900 focus:outline-none focus:ring-1 focus:ring-surface-900"
            >
              <option value="DRAFT">초안</option>
              <option value="PUBLISHED">발행</option>
              {mode === 'edit' && <option value="ARCHIVED">보관</option>}
            </select>
          </div>

          <label className="flex items-center justify-between gap-4 rounded-2xl border border-surface-200 bg-surface-50 px-4 py-4">
            <div>
              <p className="text-sm font-semibold text-surface-900">추천 포스트</p>
              <p className="mt-1 text-sm text-surface-500">
                메인 추천 영역에 노출할 수 있습니다.
              </p>
            </div>
            <input
              type="checkbox"
              checked={form.featured}
              onChange={e => onUpdateForm('featured', e.target.checked)}
              className="h-4 w-4 rounded border-surface-300 text-surface-900 focus:ring-surface-900"
            />
          </label>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-surface-400">
              카테고리
            </label>
            <select
              value={form.categoryId}
              onChange={e => onUpdateForm('categoryId', e.target.value)}
              data-cy="post-editor-category"
              className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-surface-900 focus:outline-none focus:ring-1 focus:ring-surface-900"
              required
            >
              <option value="">카테고리 선택</option>
              {isHydrated && categories?.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {'  '.repeat(cat.depth)}
                  {cat.icon && `${cat.icon} `}
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-surface-400">
              태그
            </label>
            {isHydrated ? (
              <TagSelector
                selectedTagIds={form.tagIds}
                onChange={tagIds => onUpdateForm('tagIds', tagIds)}
              />
            ) : (
              <div className="h-[42px] rounded-2xl border border-surface-200 bg-surface-50" />
            )}
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-surface-200 bg-white p-5 shadow-sm">
        <button
          type="button"
          onClick={() => setShowSeo(prev => !prev)}
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
            {showSeo ? '접기' : '열기'}
          </span>
        </button>

        {showSeo && (
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-surface-400">
                메타 제목
              </label>
              <input
                type="text"
                value={form.metaTitle}
                onChange={e => onUpdateForm('metaTitle', e.target.value)}
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
                onChange={e => onUpdateForm('metaDescription', e.target.value)}
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
                onChange={e => onUpdateForm('keywords', e.target.value)}
                placeholder="React, TypeScript, 프론트엔드"
                className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-1 focus:ring-surface-900"
              />
            </div>
          </div>
        )}
      </div>

      <div className="rounded-[28px] border border-surface-200 bg-surface-900 p-5 text-white shadow-[0_20px_50px_rgba(15,23,42,0.14)]">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
          Ready
        </p>
        <h3 className="mt-3 text-xl font-black tracking-tight">
          문서 상태를 저장합니다
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-white/70">
          작성 중인 초안은 자동 저장되고, 여기서 발행 상태와 함께 최종 저장할 수 있습니다.
        </p>

        {lastSavedText && (
          <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
            {lastSavedText}
          </p>
        )}

        <div className="mt-5 space-y-3">
          <button
            type="submit"
            disabled={isSubmitting}
            data-cy="post-editor-submit"
            className="w-full rounded-full bg-white px-6 py-3 font-semibold text-surface-900 transition-colors hover:bg-surface-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? '저장 중...'
              : mode === 'create'
                ? '포스트 저장'
                : '변경사항 저장'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/admin/posts')}
            className="w-full rounded-full border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    </aside>
  );
}
