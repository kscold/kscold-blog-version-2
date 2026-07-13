'use client';

import Link from 'next/link';
import { Category } from '@/shared/model/types/blog';

export function CategoryTree({ categories, depth = 0, onNavigate }: { categories: Category[]; depth?: number; onNavigate?: () => void }) {
  const rootCategories = categories.filter(cat => cat.depth === depth);

  return (
    <ul className={depth > 0 ? 'ml-4 mt-1 space-y-1' : 'space-y-1'}>
      {rootCategories.map(category => {
        const children = categories.filter(
          cat => cat.parent === category.id && cat.depth === depth + 1
        );

        return (
          <li key={category.id}>
            <Link
              href={`/blog/${category.slug}`}
              onClick={onNavigate}
              className="group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-300 hover:bg-white/5 hover:shadow-[inset_0_0_20px_rgba(6,182,212,0.1)] relative overflow-hidden"
            >
              <div className="absolute left-0 w-1 h-0 bg-surface-900 group-hover:h-full transition-all duration-300 top-1/2 -translate-y-1/2 rounded-full opacity-0 group-hover:opacity-100" />
              {category.icon && (
                <span className="text-surface-400 group-hover:text-surface-900 transition-colors relative z-10">
                  {category.icon}
                </span>
              )}
              <span className="flex-1 text-surface-600 group-hover:text-surface-900 transition-colors font-medium tracking-wide relative z-10">
                {category.name}
              </span>
              <span className="text-[10px] text-surface-400 group-hover:text-surface-900 font-mono relative z-10">
                {category.postCount}
              </span>
            </Link>
            {children.length > 0 && <CategoryTree categories={categories} depth={depth + 1} onNavigate={onNavigate} />}
          </li>
        );
      })}
    </ul>
  );
}
