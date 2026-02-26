'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { parseMarkdownFile } from '@/lib/markdown-parser';
import { useCategories } from '@/hooks/useCategories';
import { useResolveTag, useCheckSlugExists, useImportPost } from '@/hooks/useImportPosts';
import { ParsedMarkdownFile, ImportResult, ImportStatus } from '@/types/import';
import { PostCreateRequest } from '@/types/api';

export default function ImportPage() {
  const [files, setFiles] = useState<ParsedMarkdownFile[]>([]);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [importStatus, setImportStatus] = useState<ImportStatus>('idle');
  const [globalCategoryId, setGlobalCategoryId] = useState('');
  const [globalPostStatus, setGlobalPostStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categories } = useCategories();
  const resolveTag = useResolveTag();
  const checkSlug = useCheckSlugExists();
  const importPost = useImportPost();

  const handleFiles = useCallback(async (fileList: FileList) => {
    setImportStatus('parsing');
    const mdFiles = Array.from(fileList).filter(
      f => f.name.endsWith('.md') || f.name.endsWith('.markdown')
    );

    if (mdFiles.length === 0) {
      alert('.md 파일만 업로드할 수 있습니다.');
      setImportStatus('idle');
      return;
    }

    const parsed: ParsedMarkdownFile[] = [];
    for (const file of mdFiles) {
      const text = await file.text();
      parsed.push(parseMarkdownFile(file.name, text));
    }

    setFiles(parsed);
    setImportStatus('previewing');
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  const updateFile = (index: number, updates: Partial<ParsedMarkdownFile>) => {
    setFiles(prev => prev.map((f, i) => (i === index ? { ...f, ...updates } : f)));
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleImportAll = async () => {
    if (!globalCategoryId) {
      alert('카테고리를 선택해주세요.');
      return;
    }

    setImportStatus('importing');
    setProgress({ current: 0, total: files.length });
    const results: ImportResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress({ current: i + 1, total: files.length });

      try {
        // 1. 태그 이름 -> ID 변환
        const tagIds: string[] = [];
        for (const tagName of file.tags) {
          const tag = await resolveTag.mutateAsync(tagName);
          tagIds.push(tag.id);
        }

        // 2. 슬러그 중복 확인 및 유니크 슬러그 생성
        let slug = file.slug;
        let exists = await checkSlug.mutateAsync(slug);
        if (exists) {
          let counter = 1;
          while (exists) {
            slug = `${file.slug}-${counter}`;
            exists = await checkSlug.mutateAsync(slug);
            counter++;
          }
        }

        // 3. 포스트 생성
        const postData: PostCreateRequest = {
          title: file.title,
          slug,
          content: file.content,
          excerpt: file.excerpt || undefined,
          coverImage: file.coverImage || undefined,
          categoryId: globalCategoryId,
          tagIds: tagIds.length > 0 ? tagIds : undefined,
          status: globalPostStatus,
          source: 'MARKDOWN_IMPORT',
          originalFilename: file.filename,
        };

        const post = await importPost.mutateAsync(postData);
        results.push({ filename: file.filename, success: true, postId: post.id });
      } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : '알 수 없는 오류';
        results.push({ filename: file.filename, success: false, error: errMsg });
      }
    }

    setImportResults(results);
    setImportStatus('done');
  };

  const successCount = importResults.filter(r => r.success).length;
  const failCount = importResults.filter(r => !r.success).length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
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

      {/* Drop Zone */}
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

      {/* Preview */}
      {importStatus === 'previewing' && files.length > 0 && (
        <div className="space-y-8">
          {/* Global Settings */}
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
                  onChange={e => setGlobalCategoryId(e.target.value)}
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
                  onChange={e => setGlobalPostStatus(e.target.value as 'DRAFT' | 'PUBLISHED')}
                  className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white text-surface-900 focus:outline-none focus:ring-2 focus:ring-surface-900"
                >
                  <option value="DRAFT">DRAFT (임시저장)</option>
                  <option value="PUBLISHED">PUBLISHED (즉시 게시)</option>
                </select>
              </div>
            </div>
          </div>

          {/* File List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-surface-900">{files.length}개 파일</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setFiles([]);
                    setImportStatus('idle');
                  }}
                  className="px-4 py-2 text-sm text-surface-600 border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors"
                >
                  초기화
                </button>
                <button
                  onClick={handleImportAll}
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
                        onChange={e => updateFile(index, { title: e.target.value })}
                        className="text-lg font-bold text-surface-900 bg-transparent border-none outline-none w-full focus:ring-0 p-0"
                        placeholder="제목"
                      />
                      <div className="mt-1 flex items-center gap-3 text-xs text-surface-400">
                        <span className="font-mono">{file.filename}</span>
                        {file.date && <span>{file.date}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-surface-400 hover:text-red-500 transition-colors p-1"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Slug */}
                  <div className="mt-3">
                    <label className="text-xs text-surface-400">slug:</label>
                    <input
                      type="text"
                      value={file.slug}
                      onChange={e => updateFile(index, { slug: e.target.value })}
                      className="ml-2 text-sm text-surface-600 font-mono bg-transparent border-none outline-none focus:ring-0 p-0"
                    />
                  </div>

                  {/* Tags */}
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

                  {/* Excerpt */}
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
      )}

      {/* Importing Progress */}
      {importStatus === 'importing' && (
        <div className="text-center py-20">
          <div className="w-16 h-16 border-4 border-surface-200 border-t-surface-900 rounded-full animate-spin mx-auto" />
          <p className="mt-6 text-lg font-medium text-surface-900">
            가져오는 중... ({progress.current}/{progress.total})
          </p>
          <div className="mt-4 max-w-xs mx-auto bg-surface-100 rounded-full h-2">
            <div
              className="bg-surface-900 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(progress.current / progress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Results */}
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
              onClick={() => {
                setFiles([]);
                setImportResults([]);
                setImportStatus('idle');
              }}
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
