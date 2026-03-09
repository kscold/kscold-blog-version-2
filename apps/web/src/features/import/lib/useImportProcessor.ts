'use client';

import { useState, useCallback, useRef } from 'react';
import { parseMarkdownFile } from '@/shared/lib/markdown-parser';
import { useResolveTag, useCheckSlugExists, useImportPost } from '@/features/feed/api/useImportPosts';
import type { ParsedMarkdownFile, ImportResult, ImportStatus } from '@/types/import';
import type { PostCreateRequest } from '@/types/blog';
import { useAlert } from '@/shared/model/alertStore';

interface ImportProgress {
  current: number;
  total: number;
}

interface UseImportProcessorReturn {
  files: ParsedMarkdownFile[];
  importResults: ImportResult[];
  importStatus: ImportStatus;
  progress: ImportProgress;
  dragOver: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  successCount: number;
  failCount: number;
  setDragOver: (value: boolean) => void;
  handleFiles: (fileList: FileList) => Promise<void>;
  handleDrop: (e: React.DragEvent) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  updateFile: (index: number, updates: Partial<ParsedMarkdownFile>) => void;
  removeFile: (index: number) => void;
  handleImportAll: (globalCategoryId: string, globalPostStatus: 'DRAFT' | 'PUBLISHED') => Promise<void>;
  resetAll: () => void;
  resetToIdle: () => void;
}

export function useImportProcessor(): UseImportProcessorReturn {
  const [files, setFiles] = useState<ParsedMarkdownFile[]>([]);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [importStatus, setImportStatus] = useState<ImportStatus>('idle');
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState<ImportProgress>({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resolveTag = useResolveTag();
  const checkSlug = useCheckSlugExists();
  const importPost = useImportPost();
  const alert = useAlert();

  const handleFiles = useCallback(async (fileList: FileList) => {
    setImportStatus('parsing');
    const mdFiles = Array.from(fileList).filter(
      f => f.name.endsWith('.md') || f.name.endsWith('.markdown'),
    );

    if (mdFiles.length === 0) {
      alert.warning('.md 파일만 업로드할 수 있습니다.');
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
    [handleFiles],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles],
  );

  const updateFile = (index: number, updates: Partial<ParsedMarkdownFile>) => {
    setFiles(prev => prev.map((f, i) => (i === index ? { ...f, ...updates } : f)));
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleImportAll = async (
    globalCategoryId: string,
    globalPostStatus: 'DRAFT' | 'PUBLISHED',
  ) => {
    if (!globalCategoryId) {
      alert.warning('카테고리를 선택해주세요.');
      return;
    }

    setImportStatus('importing');
    setProgress({ current: 0, total: files.length });
    const results: ImportResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress({ current: i + 1, total: files.length });

      try {
        const tagIds: string[] = [];
        for (const tagName of file.tags) {
          const tag = await resolveTag.mutateAsync(tagName);
          tagIds.push(tag.id);
        }

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

  const resetAll = () => {
    setFiles([]);
    setImportResults([]);
    setImportStatus('idle');
  };

  const resetToIdle = () => {
    setFiles([]);
    setImportStatus('idle');
  };

  const successCount = importResults.filter(r => r.success).length;
  const failCount = importResults.filter(r => !r.success).length;

  return {
    files,
    importResults,
    importStatus,
    progress,
    dragOver,
    fileInputRef,
    successCount,
    failCount,
    setDragOver,
    handleFiles,
    handleDrop,
    handleFileSelect,
    updateFile,
    removeFile,
    handleImportAll,
    resetAll,
    resetToIdle,
  };
}
