'use client';

import { PUBLICATION, type PublicationChoice } from '@/entities/post';
import { TagSelector } from '../TagSelector';
import type { PostEditorSidebarProps } from './postEditorSidebar.types';

type Props = Pick<PostEditorSidebarProps, 'categories' | 'category' | 'form' | 'mode' | 'state' |
  'needsReview' | 'publicationError' | 'onSelect' | 'onCategoryChange' | 'onUpdateForm'>;

export function PostEditorPublishPanel(props: Props) {
  const { categories, category, form, mode, state, needsReview, publicationError, onSelect, onCategoryChange, onUpdateForm } = props;
  const choices: PublicationChoice[] = mode === 'edit' ? ['draft', 'public', 'restricted', 'archived'] : ['draft', 'public', 'restricted'];
  return (
    <section id="post-publish-settings" aria-labelledby="post-publish-title" className="scroll-mt-24 rounded-3xl border border-surface-200 bg-white p-5 shadow-xs">
      <h2 id="post-publish-title" className="text-xl font-bold text-surface-900">발행 설정</h2>
      <p className="mt-2 text-sm leading-6 text-surface-500">누가 읽을 수 있는지 확인하고 저장해 주세요.</p>
      <div className="mt-5 space-y-5">
        <div>
          <label htmlFor="post-category" className="mb-2 block text-sm font-semibold text-surface-700">카테고리</label>
          <select id="post-category" value={form.categoryId} onChange={event => onCategoryChange(event.target.value)}
            data-testid="post-editor-category" aria-describedby="publication-error"
            className="w-full rounded-xl border border-surface-200 bg-surface-50 px-3 py-3 text-sm text-surface-900">
            <option value="">카테고리 선택</option>
            {categories?.map(item => <option key={item.id} value={item.id}>{'　'.repeat(item.depth)}{item.name}{item.restricted ? ' · 승인 필요' : ''}</option>)}
          </select>
          <p id="publication-error" role={publicationError && form.categoryId ? 'alert' : undefined} className="mt-2 text-xs leading-5 text-amber-800">{publicationError}</p>
        </div>
        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-semibold text-surface-700">저장 후 상태</legend>
          {choices.map(choice => {
            const disabled = (choice === 'restricted' && !category?.restricted) || ((choice === 'public' || choice === 'restricted') && !category);
            const selected = state === choice && !needsReview;
            return (
              <label key={choice} className={'flex items-start gap-3 rounded-2xl border p-3 ' +
                (disabled ? 'border-surface-100 bg-surface-50 text-surface-400' : selected ? 'border-primary-400 bg-primary-50 text-surface-900' : 'border-surface-200 text-surface-700')}>
                <input type="radio" name="publication" value={choice} checked={selected} disabled={disabled}
                  onChange={() => onSelect(choice)} data-testid={'post-publication-' + choice}
                  className="mt-1 h-4 w-4 shrink-0 accent-surface-900" />
                <span><span className="block text-sm font-semibold">{PUBLICATION[choice].label}</span>
                  <span className="mt-1 block text-xs leading-5">{choice === 'restricted' && !category?.restricted
                    ? '제한 카테고리를 선택해야 사용할 수 있습니다.' : PUBLICATION[choice].description}</span></span>
              </label>
            );
          })}
        </fieldset>
        {state === 'public' && category && <p className="text-xs leading-5 text-surface-500">{form.publicOverride
          ? '이 글은 카테고리 제한과 관계없이 공개하는 개별 설정을 사용합니다.'
          : '이 글은 현재 카테고리의 공개 설정을 따릅니다.'}</p>}
        <label className="flex items-center justify-between gap-3 border-t border-surface-200 pt-4">
          <span><span className="block text-sm font-semibold text-surface-900">추천 포스트</span><span className="mt-1 block text-xs text-surface-500">공개 범위와 별도로 추천 영역에 표시합니다.</span></span>
          <input type="checkbox" checked={form.featured} onChange={event => onUpdateForm('featured', event.target.checked)} className="h-4 w-4 accent-surface-900" />
        </label>
        <div>
          <p className="mb-2 text-sm font-semibold text-surface-700">주제 태그</p>
          <TagSelector selectedTagIds={form.tagIds} onChange={tagIds => onUpdateForm('tagIds', tagIds)} />
        </div>
      </div>
    </section>
  );
}
