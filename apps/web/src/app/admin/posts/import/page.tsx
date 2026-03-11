'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCategories } from '@/entities/category/api/useCategories';
import { useImportProcessor } from '@/features/import/lib/useImportProcessor';
import { ImportFileList } from '@/features/import/ui/ImportFileList';

export default function ImportPage() {
  const [globalCategoryId, setGlobalCategoryId] = useState('');
  const [globalPostStatus, setGlobalPostStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');

  const { data: categories } = useCategories();

  const {
    files,
    importResults,
    importStatus,
    progress,
    dragOver,
    fileInputRef,
    successCount,
    failCount,
    setDragOver,
    handleDrop,
    handleFileSelect,
    updateFile,
    removeFile,
    handleImportAll,
    resetAll,
    resetToIdle,
  } = useImportProcessor();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 tracking-tight">Markdown 가져오기</h1>
          <p className="mt-2 text-surface-500">.md 파일을 업로드하여 블로그 포스트로 변환합니다</p>
        </div>
        <Link
          href="/admin/posts"
          className="px-4 py-2 text-sm text-surface-600 border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors"
        >
          돌아가기
        </Link>
      </div>

      {/* 드롭 영역 */}
      {importStatus === 'idle' && (
        <div
          onDragOver={e => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-surface-900 bg-surface-50'
              : 'border-surface-300 hover:border-surface-400'
          }`}
        >
          <div className="text-4xl mb-4">
            <svg
              className="w-12 h-12 mx-auto text-surface-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-surface-600 font-medium">
            .md 파일을 여기에 드래그하거나 클릭하여 선택하세요
          </p>
          <p className="mt-2 text-sm text-surface-400">
            옵시디언, 노션 내보내기, 일반 Markdown 모두 지원
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* 미리보기 */}
      {importStatus === 'previewing' && files.length > 0 && (
        <ImportFileList
          files={files}
          categories={categories}
          globalCategoryId={globalCategoryId}
          globalPostStatus={globalPostStatus}
          onGlobalCategoryChange={setGlobalCategoryId}
          onGlobalPostStatusChange={setGlobalPostStatus}
          onUpdateFile={updateFile}
          onRemoveFile={removeFile}
          onImportAll={() => handleImportAll(globalCategoryId, globalPostStatus)}
          onReset={resetToIdle}
        />
      )}

      {/* 가져오기 진행 중 */}
      {importStatus === 'importing' && (
        <div className="text-center py-20">
          <div className="w-16 h-16 border-4 border-surface-200 border-t-surface-900 rounded-full animate-spin mx-auto" />
          <p className="mt-6 text-lg font-medium text-surface-900">
            가져오는 중... ({progress.current}/{progress.total})
          </p>
          <div className="mt-4 max-w-xs mx-auto bg-surface-100 rounded-full h-2">
            <div
              className="bg-surface-900 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* 결과 */}
      {importStatus === 'done' && (
        <div className="space-y-6">
          <div className="bg-surface-50 border border-surface-200 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-surface-900 mb-2">가져오기 완료</h2>
            <p className="text-surface-500">
              성공: <span className="text-green-600 font-bold">{successCount}</span>
              {failCount > 0 && (
                <>
                  {' / '}실패: <span className="text-red-600 font-bold">{failCount}</span>
                </>
              )}
            </p>
          </div>

          <div className="space-y-2">
            {importResults.map(result => (
              <div
                key={result.filename}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}
              >
                <span className="text-sm font-mono text-surface-700">{result.filename}</span>
                {result.success ? (
                  <span className="text-sm font-medium text-green-700">성공</span>
                ) : (
                  <span className="text-sm text-red-600">{result.error}</span>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center pt-4">
            <button
              onClick={resetAll}
              className="px-6 py-2 text-sm border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors"
            >
              더 가져오기
            </button>
            <Link
              href="/admin/posts"
              className="px-6 py-2 text-sm font-bold text-white bg-surface-900 rounded-lg hover:bg-surface-800 transition-colors"
            >
              포스트 목록 보기
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
