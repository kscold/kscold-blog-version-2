'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Category } from '@/types/blog';

interface CategoryHeaderProps {
  category: Category;
  subcategories: Category[];
}

export function CategoryHeader({ category, subcategories }: CategoryHeaderProps) {
  return (
    <>
      {/* Breadcrumb */}
      <motion.nav
        className="mb-8 flex items-center gap-2 text-sm text-surface-500"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link
          href="/blog"
          className="hover:text-surface-900 transition-colors"
        >
          Blog
        </Link>
        <span className="text-surface-300">/</span>
        <span className="text-surface-900 font-medium">{category.name}</span>
      </motion.nav>

      {/* Header */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3 mb-4">
          {category.icon && <span className="text-4xl">{category.icon}</span>}
          <h1 className="text-5xl font-sans font-black tracking-tight text-surface-900">
            {category.name}
          </h1>
        </div>
        {category.description && (
          <p className="text-lg text-surface-500 max-w-3xl">
            {category.description}
          </p>
        )}
        <div className="mt-4 text-sm text-surface-400">
          {category.postCount}개의 포스트
        </div>
      </motion.div>

      {/* Subcategories */}
      {subcategories.length > 0 && (
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div>
            <h2 className="text-sm font-bold text-surface-900 mb-3 uppercase tracking-wider">
              하위 카테고리
            </h2>
            <div className="flex flex-wrap gap-2">
              {subcategories.map(subcat => (
                <Link
                  key={subcat.id}
                  href={`/blog/${subcat.slug}`}
                  className="px-4 py-2 bg-white border border-surface-200 rounded-lg hover:border-surface-900 hover:text-surface-900 transition-all text-sm font-medium text-surface-600"
                >
                  {subcat.icon && <span className="mr-1">{subcat.icon}</span>}
                  {subcat.name}
                  <span className="ml-2 text-xs text-surface-400">({subcat.postCount})</span>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}
