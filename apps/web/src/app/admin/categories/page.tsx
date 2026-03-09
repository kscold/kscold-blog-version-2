'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/entities/category/api/useCategories';
import { Category } from '@/types/blog';
import { CategoryTree } from '@/widgets/admin/ui/CategoryTree';
import { CategoryModal } from '@/widgets/admin/ui/CategoryModal';
import { useAlert } from '@/shared/model/alertStore';

const EMPTY_FORM = {
  name: '',
  slug: '',
  description: '',
  parent: '',
  icon: '',
  color: '',
  order: 0,
};

export default function AdminCategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const alert = useAlert();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const openCreateModal = () => {
    setFormData(EMPTY_FORM);
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
    try {
      const payload = {
        name: formData.name,
        slug: formData.slug || undefined,
        description: formData.description || undefined,
        parent: formData.parent || undefined,
        order: formData.order,
        icon: formData.icon || undefined,
        color: formData.color || undefined,
      };
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, data: payload });
      } else {
        await createCategory.mutateAsync(payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : '저장에 실패했습니다.';
      alert.error(message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" 카테고리를 삭제하시겠습니까?`)) return;
    try {
      await deleteCategory.mutateAsync(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : '삭제에 실패했습니다.';
      alert.error(message);
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
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
