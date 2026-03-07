'use client';

import { Category } from '@/types/blog';

interface CategoryTreeProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: string, name: string) => void;
}

export function CategoryTree({ categories, onEdit, onDelete }: CategoryTreeProps) {
  const renderTree = (parentId: string | null = null, depth = 0): React.ReactNode => {
    const filteredCategories = categories.filter(cat =>
      parentId === null ? !cat.parent : cat.parent === parentId
    );

    if (filteredCategories.length === 0) return null;

    return (
      <ul className={depth > 0 ? 'ml-8 mt-2' : ''}>
        {filteredCategories.map(category => (
          <li key={category.id} className="mb-2">
            <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-600 dark:hover:border-purple-400 transition-colors">
              <div className="flex items-center gap-3">
                {category.icon && <span className="text-2xl">{category.icon}</span>}
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
                  onClick={() => onEdit(category)}
                  className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  수정
                </button>
                <button
                  onClick={() => onDelete(category.id, category.name)}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                >
                  삭제
                </button>
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
