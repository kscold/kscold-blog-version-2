'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { OnMount } from '@monaco-editor/react';
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

type IStandaloneCodeEditor = Parameters<OnMount>[0];

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

  const editorRef = useRef<IStandaloneCodeEditor | null>(null);

  const updateForm = useCallback(<K extends keyof PostFormData>(key: K, value: PostFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const { lastSavedText, restoredFromAutosave, tryRestoreAutosave, clearAutosave } =
    usePostAutosave({ autosaveKey, mode, form });

  const serializedInitialData = JSON.stringify(initialData);

  // 초기 데이터 변경 시 폼 업데이트 (edit 모드)
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setForm({ ...DEFAULT_FORM, ...initialData });
      setSlugEdited(true);
    }
  }, [serializedInitialData]); // eslint-disable-line react-hooks/exhaustive-deps

  // 자동 슬러그 생성
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

  // 임시저장 복구 (마운트 시 1회)
  useEffect(() => {
    tryRestoreAutosave((savedForm) => {
      setForm(savedForm);
      setSlugEdited(true);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 메인 컬럼 */}
            <div className="lg:col-span-2 space-y-4">
              <PostEditorHeader
                mode={mode}
                form={form}
                viewMode={viewMode}
                slugEdited={slugEdited}
                restoredFromAutosave={restoredFromAutosave}
                onViewModeChange={setViewMode}
                onTitleChange={value => updateForm('title', value)}
                onSlugChange={value => updateForm('slug', value)}
                onSlugEdited={() => setSlugEdited(true)}
                onContentChange={value => updateForm('content', value)}
                onExcerptChange={value => updateForm('excerpt', value)}
                editorRef={editorRef}
              />
            </div>

            {/* 사이드바 */}
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
