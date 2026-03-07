'use client';

import { motion } from 'framer-motion';
import { Category } from '@/types/blog';

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  parent: string;
  icon: string;
  color: string;
  order: number;
}

interface CategoryModalProps {
  isOpen: boolean;
  editingCategory: Category | null;
  formData: CategoryFormData;
  categories: Category[] | undefined;
  onFormChange: (data: CategoryFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function CategoryModal({
  isOpen,
  editingCategory,
  formData,
  categories,
  onFormChange,
  onSubmit,
  onClose,
}: CategoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {editingCategory ? '카테고리 수정' : '새 카테고리'}
          </h2>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                이름 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => onFormChange({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                슬러그 *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={e => onFormChange({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                아이콘 (이모지)
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={e => onFormChange({ ...formData, icon: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                부모 카테고리
              </label>
              <select
                value={formData.parent}
                onChange={e => onFormChange({ ...formData, parent: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="">없음 (최상위)</option>
                {categories
                  ?.filter(cat => cat.depth < 4)
                  .map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {'  '.repeat(cat.depth)}
                      {cat.icon && `${cat.icon} `}
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={e => onFormChange({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              저장
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
