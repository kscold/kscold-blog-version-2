'use client';

import type { ParsedMarkdownFile } from '@/types/import';

interface Category {
  id: string;
  name: string;
  depth: number;
}

interface ImportFileListProps {
  files: ParsedMarkdownFile[];
  categories: Category[] | undefined;
  globalCategoryId: string;
  globalPostStatus: 'DRAFT' | 'PUBLISHED';
  onGlobalCategoryChange: (value: string) => void;
  onGlobalPostStatusChange: (value: 'DRAFT' | 'PUBLISHED') => void;
  onUpdateFile: (index: number, updates: Partial<ParsedMarkdownFile>) => void;
  onRemoveFile: (index: number) => void;
  onImportAll: () => void;
  onReset: () => void;
}

export function ImportFileList({
  files,
  categories,
  globalCategoryId,
  globalPostStatus,
  onGlobalCategoryChange,
  onGlobalPostStatusChange,
  onUpdateFile,
  onRemoveFile,
  onImportAll,
  onReset,
}: ImportFileListProps) {
  return (
    <div className="space-y-8">
      {/* 전역 설정 */}
      <div className="bg-surface-50 border border-surface-200 rounded-xl p-6">
        <h2 className="text-sm font-bold text-surface-700 uppercase tracking-wider mb-4">
          전역 설정
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-600 mb-1">
              카테고리 (필수)
            </label>
            <select
              value={globalCategoryId}
              onChange={e => onGlobalCategoryChange(e.target.value)}
              className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white text-surface-900 focus:outline-none focus:ring-2 focus:ring-surface-900"
            >
              <option value="">카테고리 선택</option>
              {categories?.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {'  '.repeat(cat.depth)}
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-600 mb-1">게시 상태</label>
            <select
              value={globalPostStatus}
              onChange={e => onGlobalPostStatusChange(e.target.value as 'DRAFT' | 'PUBLISHED')}
              className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white text-surface-900 focus:outline-none focus:ring-2 focus:ring-surface-900"
            >
              <option value="DRAFT">DRAFT (임시저장)</option>
              <option value="PUBLISHED">PUBLISHED (즉시 게시)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 파일 목록 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-surface-900">{files.length}개 파일</h2>
          <div className="flex gap-2">
            <button
              onClick={onReset}
              className="px-4 py-2 text-sm text-surface-600 border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors"
            >
              초기화
            </button>
            <button
              onClick={onImportAll}
              disabled={!globalCategoryId}
              className="px-6 py-2 text-sm font-bold text-white bg-surface-900 rounded-lg hover:bg-surface-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              전체 가져오기
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {files.map((file, index) => (
            <div
              key={file.filename}
              className="border border-surface-200 rounded-xl p-5 bg-white"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={file.title}
                    onChange={e => onUpdateFile(index, { title: e.target.value })}
                    className="text-lg font-bold text-surface-900 bg-transparent border-none outline-none w-full focus:ring-0 p-0"
                    placeholder="제목"
                  />
                  <div className="mt-1 flex items-center gap-3 text-xs text-surface-400">
                    <span className="font-mono">{file.filename}</span>
                    {file.date && <span>{file.date}</span>}
                  </div>
                </div>
                <button
                  onClick={() => onRemoveFile(index)}
                  className="text-surface-400 hover:text-red-500 transition-colors p-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* 슬러그 */}
              <div className="mt-3">
                <label className="text-xs text-surface-400">slug:</label>
                <input
                  type="text"
                  value={file.slug}
                  onChange={e => onUpdateFile(index, { slug: e.target.value })}
                  className="ml-2 text-sm text-surface-600 font-mono bg-transparent border-none outline-none focus:ring-0 p-0"
                />
              </div>

              {/* 태그 목록 */}
              {file.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {file.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs font-medium text-surface-600 bg-surface-100 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* 발췌문 */}
              <p className="mt-3 text-sm text-surface-500 line-clamp-2">{file.excerpt}</p>

              {/* Warnings */}
              {file.parseWarnings.length > 0 && (
                <div className="mt-2 text-xs text-amber-600">
                  {file.parseWarnings.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
