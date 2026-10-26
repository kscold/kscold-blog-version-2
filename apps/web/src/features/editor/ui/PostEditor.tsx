'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCategories } from '@/entities/category';
import { PUBLICATION, getPostPublication } from '@/entities/post';
import type { Post } from '@/shared/model/types/blog';
import { usePostForm } from '../model/usePostForm';
import { usePostPublication } from '../model/usePostPublication';
import { usePostSlugCheck } from '../model/usePostSlugCheck';
import { usePostSubmission } from '../model/usePostSubmission';
import { usePostAutosave } from '../lib/usePostAutosave';
import { PostEditorHeader, type ViewMode } from './PostEditorHeader';
import { PostEditorSidebar } from './PostEditorSidebar';
import { PostEditorAddressPanel } from './PostEditorAddressPanel';
import { PostPublishConfirmation } from './PostPublishConfirmation';
import { PostSaveResult } from './PostSaveResult';
import { PostAutosaveNotice } from './PostAutosaveNotice';
import type { PostFormData, PostSaveResult as SaveResult, PostSubmission } from '../model/types';

export type { PostFormData };

interface Props {
  mode: 'create' | 'edit';
  post?: Post;
  onSubmit: (data: PostSubmission) => Promise<SaveResult>;
  isSubmitting: boolean;
  autosaveKey: string;
}

export function PostEditor({ mode, post, onSubmit, isSubmitting, autosaveKey }: Props) {
  const router = useRouter();
  const categories = useCategories();
  const editor = usePostForm(post);
  const { form, baseline } = editor;
  const [viewMode, setViewMode] = useState<ViewMode>('editor');
  const publication = usePostPublication({ form, categories: categories.data, categoriesError: categories.isError, setForm: editor.setForm });
  const slugCheck = usePostSlugCheck(form.slug, baseline?.slug);
  const autosave = usePostAutosave({
    autosaveKey, form, postId: baseline?.id, updatedAt: baseline?.updatedAt,
    dirty: editor.dirty, enabled: !isSubmitting,
  });
  const submission = usePostSubmission({
    form, baseline, changeSlug: editor.changeSlug, category: publication.category, state: publication.state,
    publicationError: publication.error, onSubmit, onSaved: editor.acceptSaved, clearAutosave: autosave.clearAutosave,
  });
  const busy = isSubmitting || submission.busy;
  const currentLabel = baseline ? PUBLICATION[getPostPublication(baseline)].label : '아직 서버에 저장하지 않음';
  const nextLabel = publication.needsReview ? '공개 범위 재확인 필요' : PUBLICATION[publication.state].label;
  const submitLabel = baseline?.status === 'PUBLISHED' && form.status !== 'PUBLISHED' ? '발행 중단 확인'
    : form.status === 'PUBLISHED' ? baseline?.status === 'PUBLISHED' ? '변경사항 반영' : '발행 내용 확인'
    : form.status === 'ARCHIVED' ? '보관 내용 확인' : '초안 저장';

  if (submission.result) return <div className="p-4 py-8 sm:p-8"><PostSaveResult result={submission.result} onContinue={() => {
    if (mode === 'create') router.replace('/admin/posts/' + submission.result!.post.id + '/edit');
    else submission.continueEditing();
  }} /></div>;

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="mx-auto max-w-[1400px] space-y-4 px-4 py-8 sm:px-6 lg:px-8">
        <section aria-label="현재 상태와 저장 후 상태" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-surface-200 bg-white p-4 text-sm">
          <p className="text-surface-600">현재 저장 상태 <strong data-testid="post-current-state" className="ml-2 text-surface-900">{currentLabel}</strong></p>
          <p className="text-surface-600">저장 후 상태 <strong data-testid="post-planned-state" className="ml-2 text-surface-900">{nextLabel}</strong></p>
          <a href="#post-publish-settings" className="rounded-full bg-surface-100 px-4 py-2 font-semibold text-surface-700">발행 설정으로</a>
        </section>
        {autosave.recovery && <PostAutosaveNotice recovery={autosave.recovery} existing={Boolean(baseline)} isOlder={autosave.isOlder}
          onRestore={() => autosave.restore(editor.restore)} onDiscard={autosave.clearAutosave} />}
        {editor.remoteChanged && <p role="status" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">서버의 저장본이 변경되었습니다. 현재 입력은 유지했으니 저장 전에 다른 편집 내용을 확인해 주세요.</p>}
        {submission.error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{submission.error}</p>}
        <form noValidate onSubmit={event => { event.preventDefault(); void submission.begin(); }}>
          <fieldset disabled={busy} inert={busy} className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-8">
            <PostEditorHeader mode={mode} form={form} viewMode={viewMode} restoredFromAutosave={autosave.restoredFromAutosave}
              onViewModeChange={setViewMode} onTitleChange={editor.updateTitle}
              onContentChange={value => editor.updateField('content', value)} onExcerptChange={value => editor.updateField('excerpt', value)}
              onCoverImageChange={value => editor.updateField('coverImage', value)} editorKey={editor.editorKey}
              address={<PostEditorAddressPanel slug={form.slug} category={publication.category} originalSlug={baseline?.slug}
                unlocked={editor.slugUnlocked} error={form.slug || submission.attempted ? slugCheck.error : null}
                checking={slugCheck.pending} onChange={editor.updateSlug} onUnlock={editor.unlockSlug} onCancel={editor.cancelSlugChange} />} />
            <PostEditorSidebar mode={mode} form={form} categories={categories.data} category={publication.category}
              state={publication.state} needsReview={publication.needsReview} publicationError={publication.error}
              isSubmitting={busy} lastSavedText={autosave.lastSavedText} submitLabel={submitLabel}
              onSelect={publication.select} onCategoryChange={publication.selectCategory} onUpdateForm={editor.updateField} />
          </fieldset>
        </form>
        {submission.confirmation && <PostPublishConfirmation value={submission.confirmation} previous={baseline}
          busy={busy} onConfirm={() => void submission.confirm()} onCancel={submission.cancel} />}
      </div>
    </div>
  );
}
