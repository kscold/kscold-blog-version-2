'use client';

import { Category } from '@/types/blog';

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
            <div className="rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-purple-600 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-purple-400">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  {category.icon && <span className="text-2xl">{category.icon}</span>}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </span>
                      <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                        Depth {category.depth}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {category.postCount}개 포스트
                      </span>
                    </div>
                    <div className="mt-1 break-all text-sm text-gray-500 dark:text-gray-400">
                      /{category.slug}
                    </div>
                    {category.description && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => onEdit(category)}
                    className="px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => onDelete(category.id, category.name)}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
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
