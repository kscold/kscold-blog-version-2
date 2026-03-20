'use client';

import { motion } from 'framer-motion';
import { CategoryTree } from './CategoryTree';
import { CategoryModal } from './CategoryModal';
import { useAdminCategories } from '../api/useAdminCategories';

export function AdminCategoriesSection() {
  const {
    categories,
    isLoading,
    editingCategory,
    isModalOpen,
    formData,
    setFormData,
    openCreateModal,
    openEditModal,
    handleSubmit,
    handleDelete,
    closeModal,
  } = useAdminCategories();

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
                <div key={i} className="h-24 bg-white dark:bg-gray-900 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : categories && categories.length > 0 ? (
            <CategoryTree
              categories={categories}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ) : (
            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-lg">
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

      <CategoryModal
        isOpen={isModalOpen}
        editingCategory={editingCategory}
        formData={formData}
        categories={categories}
        onFormChange={setFormData}
        onSubmit={handleSubmit}
        onClose={closeModal}
      />
    </div>
  );
}
