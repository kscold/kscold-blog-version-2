'use client';

import { Category } from '@/shared/model/types/blog';

interface CategoryTreeProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: string, name: string) => void;
}

export function CategoryTree({ categories, onEdit, onDelete }: CategoryTreeProps) {
  const renderTree = (parentId: string | null = null, depth = 0): React.ReactNode => {
    const filteredCategories = categories.filter((cat) =>
      parentId === null ? !cat.parent : cat.parent === parentId,
    );

    if (filteredCategories.length === 0) return null;

    return (
      <ul className={depth > 0 ? 'mt-2 ml-4 sm:ml-8' : ''}>
        {filteredCategories.map(category => (
          <li key={category.id} className="mb-2">
            <div className="rounded-2xl border border-surface-200 bg-white p-4 transition-colors hover:border-surface-400">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  {category.icon && <span className="text-2xl">{category.icon}</span>}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-surface-900">
                        {category.name}
                      </span>
                      <span className="rounded bg-surface-100 px-2 py-1 text-xs text-surface-600">
                        Depth {category.depth}
                      </span>
                      <span className="text-xs text-surface-500">
                        {category.postCount}개 포스트
                      </span>
                    </div>
                    <div className="mt-1 break-all text-sm text-surface-500">
                      /{category.slug}
                    </div>
                    {category.description && (
                      <p className="mt-1 text-sm text-surface-600">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => onEdit(category)}
                    className="px-3 py-1.5 text-xs font-medium text-surface-900 transition-colors hover:underline"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => onDelete(category.id, category.name)}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:text-red-700"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>

            {renderTree(category.id, depth + 1)}
          </li>
        ))}
      </ul>
    );
  };

  return <>{renderTree()}</>;
}
