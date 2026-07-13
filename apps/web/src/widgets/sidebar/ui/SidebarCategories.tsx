'use client';

import { Skeleton } from '@/shared/ui/Skeleton';
import { Category } from '@/shared/model/types/blog';
import { CategoryTree } from '@/widgets/sidebar/ui/CategoryTree';

interface SidebarCategoriesProps {
  categories: Category[] | undefined;
  onNavigate: () => void;
}

export function SidebarCategories({ categories, onNavigate }: SidebarCategoriesProps) {
  return (
    <div>
      <h2 className="text-xs font-bold text-surface-400 mb-4 tracking-[0.2em] uppercase">
        Categories
      </h2>
      {categories ? (
        <CategoryTree categories={categories} onNavigate={onNavigate} />
      ) : (
        <div className="space-y-3">
          <Skeleton className="h-4 w-4/5 rounded-md" />
          <Skeleton className="h-4 w-3/5 rounded-md" />
          <Skeleton className="h-4 w-2/3 rounded-md" />
        </div>
      )}
    </div>
  );
}
