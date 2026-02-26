'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useVaultFolders, useCreateVaultNote } from '@/hooks/useVault';
import { MarkdownContent } from '@/components/blog/MarkdownContent';
import { VaultNoteCreateRequest, VaultFolder } from '@/types/api';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function NewVaultNotePage() {
  const router = useRouter();
  const { data: folders } = useVaultFolders();
  const createNote = useCreateVaultNote();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [folderId, setFolderId] = useState('');
  const [tags, setTags] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (title && !slug) {
      const autoSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 100);
      setSlug(autoSlug);
    }
  }, [title, slug]);

  const flattenFolders = (
    folderList: VaultFolder[],
    depth = 0
  ): { folder: VaultFolder; depth: number }[] => {
    const result: { folder: VaultFolder; depth: number }[] = [];
    for (const folder of folderList) {
      result.push({ folder, depth });
      if (folder.children && folder.children.length > 0) {
        result.push(...flattenFolders(folder.children, depth + 1));
      }
    }
    return result;
  };

  const flatFolders = folders ? flattenFolders(folders.filter(f => !f.parent)) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !content || !folderId) {
      alert('제목, 내용, 폴더는 필수입니다.');
      return;
    }

    const tagList = tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t);

    const noteData: VaultNoteCreateRequest = {
      title,
      slug: slug || undefined,
      content,
      folderId,
      tags: tagList.length > 0 ? tagList : undefined,
    };

    try {
      await createNote.mutateAsync(noteData);
      alert('노트가 생성되었습니다.');
      router.push('/admin/vault');
    } catch (error: any) {
      alert(`에러: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-beige dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white">
              새 Vault 노트
            </h1>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {showPreview ? '에디터' : '프리뷰'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    제목 *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="노트 제목을 입력하세요"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    슬러그 (자동 생성됨)
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    placeholder="url-friendly-slug"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                {/* Content Editor */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    내용 * (Markdown, [[백링크]] 지원)
                  </label>
                  {showPreview ? (
                    <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-6 min-h-[600px] overflow-auto">
                      <MarkdownContent content={content} />
                    </div>
                  ) : (
                    <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                      <Editor
                        height="600px"
                        defaultLanguage="markdown"
                        value={content}
                        onChange={value => setContent(value || '')}
                        theme="vs-dark"
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
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Folder */}
                <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    폴더 *
                  </h3>
                  <select
                    value={folderId}
                    onChange={e => setFolderId(e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  >
                    <option value="">폴더 선택</option>
                    {flatFolders.map(({ folder, depth }) => (
                      <option key={folder.id} value={folder.id}>
                        {'  '.repeat(depth)}
                        {folder.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">태그</h3>
                  <input
                    type="text"
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                    placeholder="태그1, 태그2, 태그3"
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    쉼표로 구분하여 입력하세요
                  </p>
                  {tags && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {tags
                        .split(',')
                        .map(tag => tag.trim())
                        .filter(Boolean)
                        .map(tag => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                {/* Markdown Tips */}
                <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    작성 도움말
                  </h3>
                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-2 font-mono">
                    <p>[[노트 제목]] - 다른 노트로 백링크</p>
                    <p># 제목 - 헤딩</p>
                    <p>**굵게** - 볼드</p>
                    <p>`코드` - 인라인 코드</p>
                    <p>```lang - 코드 블록</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={createNote.isPending}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createNote.isPending ? '저장 중...' : '노트 저장'}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
