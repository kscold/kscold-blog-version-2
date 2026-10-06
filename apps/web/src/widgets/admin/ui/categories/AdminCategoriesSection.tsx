'use client';

import { AdminPage, AdminPageHeader } from '@/shared/ui/AdminPage';
import Button from '@/shared/ui/Button';
import { CategoryTree } from './CategoryTree';
import { CategoryModal } from './CategoryModal';
import { useAdminCategories } from '../../api/useAdminCategories';

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
    <AdminPage>
      <AdminPageHeader
        eyebrow="Categories"
        title="카테고리 관리"
        description="최대 5단계까지 계층 구조를 만들고, 제한 카테고리 운영에 필요한 흐름도 이 화면에서 함께 관리할 수 있습니다."
        actions={
          <Button size="sm" onClick={openCreateModal}>
            새 카테고리 추가
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-20 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
      ) : categories && categories.length > 0 ? (
        <CategoryTree categories={categories} onEdit={openEditModal} onDelete={handleDelete} />
      ) : (
        <div className="rounded-3xl border border-surface-200 bg-white py-20 text-center">
          <h2 className="text-xl font-black text-surface-900">카테고리가 없습니다</h2>
          <p className="mb-6 mt-2 text-sm text-surface-500">첫 번째 카테고리를 만들어보세요.</p>
          <Button size="sm" onClick={openCreateModal}>
            새 카테고리 추가
          </Button>
        </div>
      )}

      <CategoryModal
        isOpen={isModalOpen}
        editingCategory={editingCategory}
        formData={formData}
        categories={categories}
        onFormChange={setFormData}
        onSubmit={handleSubmit}
        onClose={closeModal}
      />
    </AdminPage>
  );
}
