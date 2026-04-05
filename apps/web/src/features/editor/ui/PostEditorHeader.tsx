'use client';

import dynamic from 'next/dynamic';
import { MarkdownContent } from '@/shared/ui/MarkdownContent';
import { ImageUpload } from '@/shared/ui/ImageUpload';
import type { PostFormData } from '@/features/editor/model/types';

const TiptapEditor = dynamic(() => import('@/features/editor/ui/TiptapEditor'), { ssr: false });

export type ViewMode = 'editor' | 'preview';

interface PostEditorHeaderProps {
  mode: 'create' | 'edit';
  form: PostFormData;
  viewMode: ViewMode;
  restoredFromAutosave: boolean;
  onViewModeChange: (mode: ViewMode) => void;
  onTitleChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onSlugEdited: () => void;
  onContentChange: (value: string) => void;
  onExcerptChange: (value: string) => void;
  onCoverImageChange: (value: string) => void;
  editorKey: string;
}

export function PostEditorHeader({
  mode,
  form,
  viewMode,
  restoredFromAutosave,
  onViewModeChange,
  onTitleChange,
  onSlugChange,
  onSlugEdited,
  onContentChange,
  onExcerptChange,
  onCoverImageChange,
  editorKey,
}: PostEditorHeaderProps) {
  return (
    <section
      data-cy="post-editor-surface"
      className="overflow-hidden rounded-[32px] border border-surface-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.06)]"
    >
      <div className="border-b border-surface-200 bg-surface-50/80 px-5 py-5 sm:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-surface-400">
              Writing Document
            </p>
            <div>
              <h1 className="text-3xl font-sans font-black tracking-tight text-surface-900 sm:text-4xl">
                {mode === 'create' ? '새 포스트 작성' : '포스트 수정'}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-surface-500 sm:text-base">
                노션처럼 문서에 바로 집중할 수 있게 제목, 커버 이미지, 본문을 한 흐름으로
                정리했습니다. 이미지 붙여넣기와 드래그 업로드도 그대로 지원합니다.
              </p>
            </div>
          </div>

          <div className="inline-flex w-full rounded-full border border-surface-200 bg-white p-1 sm:w-auto">
            {(['editor', 'preview'] as ViewMode[]).map(vm => (
              <button
                key={vm}
                type="button"
                onClick={() => onViewModeChange(vm)}
                data-cy={`post-editor-view-${vm}`}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors sm:flex-none ${
                  viewMode === vm
                    ? 'bg-surface-900 text-white'
                    : 'text-surface-500 hover:text-surface-900'
                }`}
              >
                {vm === 'editor' ? '문서 편집' : '미리보기'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6 px-5 py-6 sm:px-8 sm:py-8">
        {restoredFromAutosave && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            자동 저장된 문서를 복구했습니다.
          </div>
        )}

        <div
          data-cy="post-editor-cover"
          className="rounded-[28px] border border-surface-200 bg-surface-50/70 p-4 sm:p-5"
        >
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-surface-900">커버 이미지</p>
              <p className="mt-1 text-sm text-surface-500">
                문서 첫인상을 결정하는 대표 이미지를 여기에 배치합니다.
              </p>
            </div>
            <span className="text-xs font-medium text-surface-400">
              드래그, 붙여넣기, 클릭 업로드 지원
            </span>
          </div>
          <ImageUpload
            currentImage={form.coverImage || undefined}
            onUploadSuccess={onCoverImageChange}
            dataCy="post-editor-cover-upload"
          />
        </div>

        <div className="rounded-[28px] border border-surface-200 bg-white p-5 sm:p-6">
          <div className="space-y-5">
            <input
              type="text"
              value={form.title}
              onChange={e => onTitleChange(e.target.value)}
              placeholder="제목 없음"
              data-cy="post-editor-title"
              className="w-full border-0 bg-transparent p-0 text-3xl font-black tracking-tight text-surface-900 placeholder:text-surface-300 focus:outline-none sm:text-5xl"
              required
            />

            <div className="rounded-2xl border border-surface-200 bg-surface-50 px-4 py-4">
              <div className="grid gap-3 sm:grid-cols-[84px_minmax(0,1fr)] sm:items-center">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-surface-400">
                  Slug
                </span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => {
                    onSlugChange(e.target.value);
                    onSlugEdited();
                  }}
                  placeholder="url-friendly-slug"
                  data-cy="post-editor-slug"
                  className="w-full rounded-2xl border border-surface-200 bg-white px-4 py-3 text-sm text-surface-700 placeholder:text-surface-400 focus:outline-none focus:ring-1 focus:ring-surface-900"
                />
              </div>
              <p className="mt-3 text-sm text-surface-500">
                발행 URL에 사용됩니다. 제목을 바꾸면 자동으로 제안되지만 직접 다듬을 수
                있습니다.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-surface-900">본문</p>
              <p className="mt-1 text-sm text-surface-500">
                노션처럼 문단 중심으로 쓰고, 필요한 블록은 상단 빠른 버튼으로 바로 추가해
                주세요.
              </p>
            </div>
          </div>

          {viewMode === 'editor' ? (
            <TiptapEditor
              key={editorKey}
              defaultContent={form.content}
              onChange={onContentChange}
              minHeight="560px"
            />
          ) : (
            <div className="min-h-[560px] rounded-[28px] border border-surface-200 bg-white px-6 py-6 sm:px-8 sm:py-8">
              <MarkdownContent content={form.content} />
            </div>
          )}
        </div>

        <div className="rounded-[28px] border border-surface-200 bg-surface-50/70 p-5 sm:p-6">
          <div className="mb-3">
            <p className="text-sm font-semibold text-surface-900">
              요약 <span className="font-normal text-surface-400">(비워두면 자동 생성)</span>
            </p>
            <p className="mt-1 text-sm text-surface-500">
              목록, 피드, 검색 결과에서 먼저 보일 짧은 소개 문구입니다.
            </p>
          </div>
          <textarea
            value={form.excerpt}
            onChange={e => onExcerptChange(e.target.value)}
            placeholder="포스트 요약을 입력하세요"
            rows={4}
            data-cy="post-editor-excerpt"
            className="w-full rounded-2xl border border-surface-200 bg-white px-4 py-4 text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-1 focus:ring-surface-900"
          />
        </div>
      </div>
    </section>
  );
}
