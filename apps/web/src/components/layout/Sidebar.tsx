'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCategories } from '@/hooks/useCategories';
import { useUiStore } from '@/store/uiStore';
import { Category } from '@/types/api';

function CategoryTree({ categories, depth = 0 }: { categories: Category[]; depth?: number }) {
  const rootCategories = categories.filter((cat) => cat.depth === depth);

  return (
    <ul className={depth > 0 ? 'ml-4 mt-1 space-y-1' : 'space-y-1'}>
      {rootCategories.map((category) => {
        const children = categories.filter(
          (cat) => cat.parent === category.id && cat.depth === depth + 1
        );

        return (
          <li key={category.id}>
            <Link
              href={`/blog/${category.slug}`}
              className="group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-300 hover:bg-white/5 hover:shadow-[inset_0_0_20px_rgba(6,182,212,0.1)] relative overflow-hidden"
            >
              <div className="absolute left-0 w-1 h-0 bg-surface-900 group-hover:h-full transition-all duration-300 top-1/2 -translate-y-1/2 rounded-full opacity-0 group-hover:opacity-100" />
              {category.icon && <span className="text-surface-400 group-hover:text-surface-900 transition-colors relative z-10">{category.icon}</span>}
              <span
                className="flex-1 text-surface-600 group-hover:text-surface-900 transition-colors font-medium tracking-wide relative z-10"
              >
                {category.name}
              </span>
              <span className="text-[10px] text-surface-400 group-hover:text-surface-900 font-mono relative z-10">{category.postCount}</span>
            </Link>
            {children.length > 0 && (
              <CategoryTree categories={categories} depth={depth + 1} />
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function Sidebar() {
  const { data: categories } = useCategories();
  const { sidebarOpen, setSidebarOpen } = useUiStore();

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`fixed top-16 left-0 bottom-0 w-56 z-40 overflow-y-auto transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 bg-white border-r border-surface-200`}
      >
        <div className="p-6 space-y-8 relative">
          {/* Mobile Navigation Links (Visible on all sizes for sidebar access) */}
          <div className="lg:hidden pb-6 border-b border-white/5 space-y-1">
             {[
               { label: 'Home', href: '/' },
               { label: 'Blog', href: '/blog' },
               { label: 'Portfolio', href: '/portfolio' },
               { label: 'About', href: '/about' },
               { label: 'Chat', href: '/chat' },
             ].map((link) => (
                <Link
                   key={link.href}
                   href={link.href}
                   onClick={() => setSidebarOpen(false)}
                   className="block px-4 py-2.5 rounded-xl text-sm font-medium text-surface-600 hover:text-surface-900 hover:bg-surface-50 transition-colors"
                >
                   {link.label}
                </Link>
             ))}
          </div>

          <div>
            <h2 className="text-xs font-bold text-surface-400 mb-4 tracking-[0.2em] uppercase">
              Categories
            </h2>
            {categories ? (
              <CategoryTree categories={categories} />
            ) : (
              <div className="text-sm text-surface-500">Loading...</div>
            )}
          </div>

          <div>
            <h2 className="text-xs font-bold text-surface-400 mb-4 tracking-[0.2em] uppercase">
              Popular Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {['React', 'TypeScript', 'Next.js', 'Spring Boot'].map((tag) => (
                <Link
                  key={tag}
                  href={`/blog/tags/${tag.toLowerCase()}`}
                  className="group relative px-3 py-1.5 text-xs font-bold text-surface-500 bg-white border border-surface-200 rounded-lg overflow-hidden transition-all hover:text-surface-900 hover:border-surface-900"
                >
                  <div className="absolute inset-0 bg-surface-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10">{tag}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
