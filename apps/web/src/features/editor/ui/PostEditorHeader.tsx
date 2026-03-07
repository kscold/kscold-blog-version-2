'use client';

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import type { OnMount } from '@monaco-editor/react';
import { MarkdownContent } from '@/shared/ui/MarkdownContent';
import { MarkdownToolbar } from '@/features/editor/ui/MarkdownToolbar';
import type { PostFormData } from '@/features/editor/ui/PostEditor';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export type ViewMode = 'editor' | 'split' | 'preview';
type IStandaloneCodeEditor = Parameters<OnMount>[0];

interface PostEditorHeaderProps {
  mode: 'create' | 'edit';
  form: PostFormData;
  viewMode: ViewMode;
  slugEdited: boolean;
  restoredFromAutosave: boolean;
  onViewModeChange: (mode: ViewMode) => void;
  onTitleChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onSlugEdited: () => void;
  onContentChange: (value: string) => void;
  onExcerptChange: (value: string) => void;
  editorRef: React.MutableRefObject<IStandaloneCodeEditor | null>;
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
  editorRef,
}: PostEditorHeaderProps) {
  const editorHeight = viewMode === 'split' ? '550px' : '600px';

  return (
    <>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-sans font-black text-surface-900">
          {mode === 'create' ? '새 포스트 작성' : '포스트 수정'}
        </h1>
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(['editor', 'split', 'preview'] as ViewMode[]).map(vm => (
            <button
              key={vm}
              type="button"
              onClick={() => onViewModeChange(vm)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === vm
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {vm === 'editor' ? '에디터' : vm === 'split' ? '분할' : '프리뷰'}
            </button>
          ))}
        </div>
      </div>

      {restoredFromAutosave && (
        <div className="mb-4 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-800 dark:text-amber-300">
          자동 저장된 내용을 복구했습니다.
        </div>
      )}

      {/* 제목 */}
      <input
        type="text"
        value={form.title}
        onChange={e => onTitleChange(e.target.value)}
        placeholder="포스트 제목을 입력하세요"
        className="w-full px-4 py-3 text-xl font-medium bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
        required
      />

      {/* 슬러그 */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">URL:</span>
        <input
          type="text"
          value={form.slug}
          onChange={e => {
            onSlugChange(e.target.value);
            onSlugEdited();
          }}
          placeholder="url-friendly-slug"
          className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
      </div>

      {/* 에디터 영역 */}
      <div>
        {viewMode !== 'preview' && (
          <MarkdownToolbar editorRef={editorRef} />
        )}

        {viewMode === 'editor' && (
          <div className="border border-gray-300 dark:border-gray-700 rounded-b-lg overflow-hidden">
            <Editor
              height={editorHeight}
              defaultLanguage="markdown"
              value={form.content}
              onChange={value => onContentChange(value || '')}
              theme="vs-dark"
              onMount={editor => {
                editorRef.current = editor;
              }}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                wordWrap: 'on',
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        )}

        {viewMode === 'split' && (
          <div className="grid grid-cols-2 gap-0 border border-gray-300 dark:border-gray-700 rounded-b-lg overflow-hidden">
            <div className="border-r border-gray-300 dark:border-gray-700">
              <Editor
                height={editorHeight}
                defaultLanguage="markdown"
                value={form.content}
                onChange={value => onContentChange(value || '')}
                theme="vs-dark"
                onMount={editor => {
                  editorRef.current = editor;
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'on',
                  wordWrap: 'on',
                  scrollBeyondLastLine: false,
                }}
              />
            </div>
            <div
              className="bg-white dark:bg-gray-900 p-4 overflow-y-auto"
              style={{ height: editorHeight }}
            >
              <MarkdownContent content={form.content} />
            </div>
          </div>
        )}

        {viewMode === 'preview' && (
          <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-6 min-h-[600px] overflow-auto">
            <MarkdownContent content={form.content} />
          </div>
        )}
      </div>

      {/* 요약 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          요약 <span className="text-gray-400 font-normal">(비워두면 자동 생성)</span>
        </label>
        <textarea
          value={form.excerpt}
          onChange={e => onExcerptChange(e.target.value)}
          placeholder="포스트 요약을 입력하세요"
          rows={3}
          className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
      </div>
    </>
  );
}
