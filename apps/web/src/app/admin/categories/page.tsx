'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCategories } from '@/hooks/useCategories';
import { Category } from '@/types/api';

export default function AdminCategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parent: '',
    icon: '',
    color: '',
    order: 0,
  });

  const openCreateModal = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      parent: '',
      icon: '',
      color: '',
      order: 0,
    });
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parent: category.parent || '',
      icon: category.icon || '',
      color: category.color || '',
      order: category.order,
    });
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    alert('카테고리 저장 기능은 백엔드 연동 후 구현됩니다.');
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" 카테고리를 삭제하시겠습니까?`)) {
      return;
    }
    alert('카테고리 삭제 기능은 백엔드 연동 후 구현됩니다.');
  };

  const renderCategoryTree = (parentId: string | null = null, depth = 0) => {
    if (!categories) return null;

    const filteredCategories = categories.filter(
      (cat) => (parentId === null ? !cat.parent : cat.parent === parentId)
    );

    if (filteredCategories.length === 0) return null;

    return (
      <ul className={depth > 0 ? 'ml-8 mt-2' : ''}>
        {filteredCategories.map((category) => (
          <li key={category.id} className="mb-2">
            <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-600 dark:hover:border-purple-400 transition-colors">
              <div className="flex items-center gap-3">
                {category.icon && (
                  <span className="text-2xl">{category.icon}</span>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                      Depth {category.depth}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {category.postCount}개 포스트
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    /{category.slug}
                  </div>
                  {category.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(category)}
                  className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDelete(category.id, category.name)}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                >
                  삭제
                </button>
              </div>
            </div>

            {renderCategoryTree(category.id, depth + 1)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="min-h-screen bg-secondary-beige dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white">
                카테고리 관리
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                최대 5단계까지 계층 구조를 만들 수 있습니다
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              새 카테고리 추가
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 bg-white dark:bg-gray-900 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : categories && categories.length > 0 ? (
            <div>{renderCategoryTree()}</div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-lg">
              <div className="text-6xl mb-4">📁</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                카테고리가 없습니다
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                첫 번째 카테고리를 만들어보세요!
              </p>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                새 카테고리 추가
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal */}
      {isModalOpen && (
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

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    이름 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
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
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
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
                    onChange={(e) =>
                      setFormData({ ...formData, icon: e.target.value })
                    }
                    placeholder="📁"
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    부모 카테고리
                  </label>
                  <select
                    value={formData.parent}
                    onChange={(e) =>
                      setFormData({ ...formData, parent: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="">없음 (최상위)</option>
                    {categories
                      ?.filter((cat) => cat.depth < 4)
                      .map((cat) => (
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
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
      )}
    </div>
  );
}
