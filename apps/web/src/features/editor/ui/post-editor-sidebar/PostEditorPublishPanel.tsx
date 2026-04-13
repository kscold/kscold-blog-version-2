'use client';

import { TagSelector } from '@/features/editor/ui/TagSelector';
import type { PostEditorSidebarProps } from './postEditorSidebar.types';

interface PostEditorPublishPanelProps
  extends Pick<PostEditorSidebarProps, 'categories' | 'form' | 'mode' | 'onUpdateForm'> {
  isHydrated: boolean;
}

export function PostEditorPublishPanel({
  categories,
  form,
  isHydrated,
  mode,
  onUpdateForm,
}: PostEditorPublishPanelProps) {
  const selectedCategory = categories?.find(category => category.id === form.categoryId);
  const isRestrictedCategory = Boolean(selectedCategory?.restricted);

  return (
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
            onChange={event => onUpdateForm('status', event.target.value as PostEditorSidebarProps['form']['status'])}
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
            onChange={event => onUpdateForm('featured', event.target.checked)}
            className="h-4 w-4 rounded border-surface-300 text-surface-900 focus:ring-surface-900"
          />
        </label>

        <label className="flex items-center justify-between gap-4 rounded-2xl border border-surface-200 bg-surface-50 px-4 py-4">
          <div>
            <p className="text-sm font-semibold text-surface-900">완전 공개</p>
            <p className="mt-1 text-sm text-surface-500">
              제한 카테고리 안에 있어도 이 글만은 열람 요청 없이 바로 공개합니다.
            </p>
          </div>
          <input
            type="checkbox"
            checked={form.publicOverride}
            onChange={event => onUpdateForm('publicOverride', event.target.checked)}
            data-cy="post-editor-public-override"
            className="h-4 w-4 rounded border-surface-300 text-surface-900 focus:ring-surface-900"
          />
        </label>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-surface-400">
            카테고리
          </label>
          <select
            value={form.categoryId}
            onChange={event => onUpdateForm('categoryId', event.target.value)}
            data-cy="post-editor-category"
            className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-surface-900 focus:outline-none focus:ring-1 focus:ring-surface-900"
            required
          >
            <option value="">카테고리 선택</option>
            {isHydrated &&
              categories?.map(category => (
                <option key={category.id} value={category.id}>
                  {'  '.repeat(category.depth)}
                  {category.icon && `${category.icon} `}
                  {category.name}
                </option>
              ))}
            </select>
          {selectedCategory && (
            <p className="mt-2 text-xs leading-5 text-surface-500">
              {isRestrictedCategory
                ? form.publicOverride
                  ? '현재 제한 카테고리지만, 이 글은 완전 공개로 우선 적용됩니다.'
                  : '현재 제한 카테고리라서 기본적으로 열람 요청이 필요합니다.'
                : '현재 공개 카테고리라서 누구나 바로 볼 수 있습니다.'}
            </p>
          )}
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
  );
}
