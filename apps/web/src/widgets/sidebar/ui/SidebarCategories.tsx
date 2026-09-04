'use client';

import { Skeleton } from '@/shared/ui/Skeleton';
import { Category } from '@/shared/model/types/blog';
import { CategoryTree } from '@/widgets/sidebar/ui/CategoryTree';

interface SidebarCategoriesProps {
  categories: Category[] | undefined;
}

export function SidebarCategories({ categories }: SidebarCategoriesProps) {
  return (
    <div>
      <h2 className="text-xs font-bold text-surface-600 mb-4 tracking-[0.2em] uppercase">
        Categories
      </h2>
      {categories ? (
        <CategoryTree categories={categories} />
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
