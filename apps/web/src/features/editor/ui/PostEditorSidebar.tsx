'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TagSelector } from '@/features/editor/ui/TagSelector';
import { ImageUpload } from '@/shared/ui/ImageUpload';
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

  return (
    <div className="space-y-4">
      {/* 발행 설정 */}
      <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          발행 설정
        </h3>
        <div className="space-y-3">
          <select
            value={form.status}
            onChange={e => onUpdateForm('status', e.target.value as PostFormData['status'])}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="DRAFT">초안</option>
            <option value="PUBLISHED">발행</option>
            {mode === 'edit' && <option value="ARCHIVED">보관</option>}
          </select>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={e => onUpdateForm('featured', e.target.checked)}
              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">추천 포스트로 표시</span>
          </label>
        </div>
      </div>

      {/* 카테고리 */}
      <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          카테고리 <span className="text-red-500">*</span>
        </h3>
        <select
          value={form.categoryId}
          onChange={e => onUpdateForm('categoryId', e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
          required
        >
          <option value="">카테고리 선택</option>
          {categories?.map(cat => (
            <option key={cat.id} value={cat.id}>
              {'  '.repeat(cat.depth)}
              {cat.icon && `${cat.icon} `}
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* 태그 */}
      <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">태그</h3>
        <TagSelector
          selectedTagIds={form.tagIds}
          onChange={tagIds => onUpdateForm('tagIds', tagIds)}
        />
      </div>

      {/* 커버 이미지 */}
      <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          커버 이미지
        </h3>
        <ImageUpload
          currentImage={form.coverImage || undefined}
          onUploadSuccess={(url: string) => onUpdateForm('coverImage', url)}
        />
      </div>

      {/* SEO 설정 */}
      <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-4">
        <button
          type="button"
          onClick={() => setShowSeo(prev => !prev)}
          className="w-full flex items-center justify-between text-sm font-semibold text-gray-900 dark:text-white"
        >
          <span>SEO 설정</span>
          <span className="text-gray-400">{showSeo ? '▲' : '▼'}</span>
        </button>

        {showSeo && (
          <div className="mt-3 space-y-3">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                메타 제목
              </label>
              <input
                type="text"
                value={form.metaTitle}
                onChange={e => onUpdateForm('metaTitle', e.target.value)}
                placeholder="검색 결과에 표시될 제목"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                메타 설명
              </label>
              <textarea
                value={form.metaDescription}
                onChange={e => onUpdateForm('metaDescription', e.target.value)}
                placeholder="검색 결과에 표시될 설명 (150자 권장)"
                rows={3}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <p className="text-xs text-gray-400 mt-1">{form.metaDescription.length}/160</p>
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                키워드 (쉼표로 구분)
              </label>
              <input
                type="text"
                value={form.keywords}
                onChange={e => onUpdateForm('keywords', e.target.value)}
                placeholder="React, TypeScript, 프론트엔드"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
          </div>
        )}
      </div>

      {/* 자동저장 상태 + 버튼 */}
      <div className="space-y-2">
        {lastSavedText && (
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            {lastSavedText}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-surface-900 text-white rounded-lg font-medium hover:bg-surface-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
          className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          취소
        </button>
      </div>
    </div>
  );
}
