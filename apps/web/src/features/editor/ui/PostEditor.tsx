'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useCategories } from '@/entities/category/api/useCategories';
import { usePostAutosave } from '@/features/editor/lib/usePostAutosave';
import { PostEditorHeader } from '@/features/editor/ui/PostEditorHeader';
import { PostEditorSidebar } from '@/features/editor/ui/PostEditorSidebar';
import type { ViewMode } from '@/features/editor/ui/PostEditorHeader';
import { useAlert } from '@/shared/model/alertStore';
import type { PostFormData } from '@/features/editor/model/types';

export type { PostFormData };

interface PostEditorProps {
  mode: 'create' | 'edit';
  initialData?: Partial<PostFormData>;
  onSubmit: (data: PostFormData) => Promise<void>;
  isSubmitting: boolean;
  autosaveKey: string;
}

const DEFAULT_FORM: PostFormData = {
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  coverImage: '',
  categoryId: '',
  tagIds: [],
  status: 'DRAFT',
  featured: false,
  publicOverride: false,
  metaTitle: '',
  metaDescription: '',
  keywords: '',
};

export function PostEditor({
  mode,
  initialData,
  onSubmit,
  isSubmitting,
  autosaveKey,
}: PostEditorProps) {
  const { data: categories } = useCategories();
  const alert = useAlert();

  const [form, setForm] = useState<PostFormData>({ ...DEFAULT_FORM, ...initialData });
  const [viewMode, setViewMode] = useState<ViewMode>('editor');
  const [slugEdited, setSlugEdited] = useState(false);
  const [editorKey, setEditorKey] = useState('initial');
  const appliedInitialDataRef = useRef<string | null>(null);

  const updateForm = useCallback(<K extends keyof PostFormData>(key: K, value: PostFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const { lastSavedText, restoredFromAutosave, tryRestoreAutosave, clearAutosave } =
    usePostAutosave({ autosaveKey, mode, form });

  const serializedInitialData = useMemo(() => JSON.stringify(initialData), [initialData]);

  useEffect(() => {
    if (!initialData || Object.keys(initialData).length === 0) {
      return;
    }
    if (appliedInitialDataRef.current === serializedInitialData) {
      return;
    }

    setForm({ ...DEFAULT_FORM, ...initialData });
    setSlugEdited(true);
    appliedInitialDataRef.current = serializedInitialData;
  }, [initialData, serializedInitialData]);

  useEffect(() => {
    if (!slugEdited && form.title) {
      const autoSlug = form.title
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 100);
      setForm(prev => ({ ...prev, slug: autoSlug }));
    }
  }, [form.title, slugEdited]);

  useEffect(() => {
    tryRestoreAutosave(savedForm => {
      setForm(savedForm);
      setSlugEdited(true);
      setEditorKey('restored-' + Date.now()); // Tiptap을 다시 마운트해 복구 내용을 즉시 반영
    });
  }, [tryRestoreAutosave]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content || !form.categoryId) {
      alert.warning('제목, 내용, 카테고리는 필수입니다.');
      return;
    }
    await onSubmit(form);
    clearAutosave();
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-8">
            <div className="space-y-4">
              <PostEditorHeader
                mode={mode}
                form={form}
                viewMode={viewMode}
                restoredFromAutosave={restoredFromAutosave}
                onViewModeChange={setViewMode}
                onTitleChange={value => updateForm('title', value)}
                onSlugChange={value => updateForm('slug', value)}
                onSlugEdited={() => setSlugEdited(true)}
                onContentChange={value => updateForm('content', value)}
                onExcerptChange={value => updateForm('excerpt', value)}
                onCoverImageChange={value => updateForm('coverImage', value)}
                editorKey={editorKey}
              />
            </div>

            <PostEditorSidebar
              mode={mode}
              form={form}
              categories={categories}
              isSubmitting={isSubmitting}
              lastSavedText={lastSavedText}
              onUpdateForm={updateForm}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
