'use client';

import { VaultFolder } from '@/types/vault';

interface FlatFolder {
  folder: VaultFolder;
  depth: number;
}

interface VaultEditorSidebarProps {
  folderId: string;
  tags: string;
  flatFolders: FlatFolder[];
  isPending: boolean;
  submitLabel: string;
  onFolderChange: (value: string) => void;
  onTagsChange: (value: string) => void;
  onCancel: () => void;
}

export default function VaultEditorSidebar({
  folderId,
  tags,
  flatFolders,
  isPending,
  submitLabel,
  onFolderChange,
  onTagsChange,
  onCancel,
}: VaultEditorSidebarProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">폴더 *</h3>
        <select
          value={folderId}
          onChange={e => onFolderChange(e.target.value)}
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

      <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">태그</h3>
        <input
          type="text"
          value={tags}
          onChange={e => onTagsChange(e.target.value)}
          placeholder="태그1, 태그2, 태그3"
          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          쉼표로 구분하여 입력하세요
        </p>
        {tags && (
          <div className="flex flex-wrap gap-1 mt-3">
            {tags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => (
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

      <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">작성 도움말</h3>
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-2 font-mono">
          <p>[[노트 제목]] - 다른 노트로 백링크</p>
          <p># 제목 - 헤딩</p>
          <p>**굵게** - 볼드</p>
          <p>`코드` - 인라인 코드</p>
          <p>```lang - 코드 블록</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? '저장 중...' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          취소
        </button>
      </div>
    </div>
  );
}
