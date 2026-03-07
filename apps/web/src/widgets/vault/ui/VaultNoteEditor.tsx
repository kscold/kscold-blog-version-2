'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useVaultFolders, useCreateVaultNote, useUpdateVaultNote } from '@/entities/vault/api/useVault';
import { MarkdownContent } from '@/shared/ui/MarkdownContent';
import { VaultFolder } from '@/types/vault';
import VaultEditorSidebar from '@/widgets/vault/ui/VaultEditorSidebar';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface VaultNoteEditorProps {
  mode: 'create' | 'edit';
  noteId?: string;
  initialData?: {
    title: string;
    slug: string;
    content: string;
    folderId: string;
    tags: string;
  };
}

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

export default function VaultNoteEditor({ mode, noteId, initialData }: VaultNoteEditorProps) {
  const router = useRouter();
  const { data: folders } = useVaultFolders();
  const createNote = useCreateVaultNote();
  const updateNote = useUpdateVaultNote();

  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [folderId, setFolderId] = useState(initialData?.folderId || '');
  const [tags, setTags] = useState(initialData?.tags || '');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setSlug(initialData.slug);
      setContent(initialData.content);
      setFolderId(initialData.folderId);
      setTags(initialData.tags);
    }
  }, [initialData]);

  useEffect(() => {
    if (mode === 'create' && title && !slug) {
      const autoSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 100);
      setSlug(autoSlug);
    }
  }, [mode, title, slug]);

  const flatFolders = folders ? flattenFolders(folders.filter(f => !f.parent)) : [];
  const mutation = mode === 'create' ? createNote : updateNote;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !folderId) {
      alert('제목, 내용, 폴더는 필수입니다.');
      return;
    }

    const tagList = tags.split(',').map(t => t.trim()).filter(t => t);
    const noteData = {
      title,
      slug: slug || undefined,
      content,
      folderId,
      tags: tagList.length > 0 ? tagList : undefined,
    };

    try {
      if (mode === 'create') {
        await createNote.mutateAsync(noteData);
        alert('노트가 생성되었습니다.');
      } else {
        await updateNote.mutateAsync({ id: noteId!, data: noteData });
        alert('노트가 수정되었습니다.');
      }
      router.push('/admin/vault');
    } catch (error: any) {
      alert(`에러: ${error.response?.data?.message || error.message}`);
    }
  };

  const pageTitle = mode === 'create' ? '새 Vault 노트' : 'Vault 노트 수정';
  const slugLabel = mode === 'create' ? '슬러그 (자동 생성됨)' : '슬러그';
  const submitLabel = mode === 'create' ? '노트 저장' : '노트 수정';

  return (
    <div className="min-h-screen bg-secondary-beige dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white">{pageTitle}</h1>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {showPreview ? '에디터' : '프리뷰'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">제목 *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="노트 제목을 입력하세요"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">{slugLabel}</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    placeholder="url-friendly-slug"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
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
                        options={{ minimap: { enabled: false }, fontSize: 14, lineNumbers: 'on', wordWrap: 'on', scrollBeyondLastLine: false }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <VaultEditorSidebar
                folderId={folderId}
                tags={tags}
                flatFolders={flatFolders}
                isPending={mutation.isPending}
                submitLabel={submitLabel}
                onFolderChange={setFolderId}
                onTagsChange={setTags}
                onCancel={() => router.back()}
              />
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
