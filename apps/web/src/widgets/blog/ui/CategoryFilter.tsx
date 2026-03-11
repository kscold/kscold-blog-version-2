'use client';

import { motion } from 'framer-motion';
import { Category } from '@/types/blog';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

export function CategoryFilter({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) {
  if (categories.length === 0) return null;

  return (
    <motion.div
      className="mb-12 flex flex-wrap justify-center gap-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.76, 0, 0.24, 1] }}
    >
      <button
        onClick={() => onCategoryChange(null)}
        className={`px-5 py-2 rounded-full text-xs font-bold tracking-widest transition-all ${
          selectedCategory === null
            ? 'bg-surface-900 text-white shadow-md'
            : 'bg-white text-surface-500 border border-surface-200 hover:border-surface-900 hover:text-surface-900'
        }`}
      >
        전체
      </button>
      {categories
        .filter(cat => cat.depth === 0)
        .map(category => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
              selectedCategory === category.id
                ? 'bg-surface-900 text-white shadow-md'
                : 'bg-white text-surface-500 border border-surface-200 hover:border-surface-900 hover:text-surface-900'
            }`}
          >
            {category.icon && <span>{category.icon}</span>}
            {category.name}
          </button>
        ))}
    </motion.div>
  );
}
