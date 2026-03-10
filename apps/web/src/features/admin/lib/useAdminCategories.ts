'use client';

import { useState } from 'react';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/entities/category/api/useCategories';
import { Category } from '@/types/blog';
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

export function useAdminCategories() {
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

  return {
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
    closeModal: () => setIsModalOpen(false),
  };
}
