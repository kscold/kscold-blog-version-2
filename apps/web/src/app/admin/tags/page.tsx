'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { TagManagementContainer } from '@/widgets/admin/ui/TagManagementContainer';

export default function AdminTagsPage() {
  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* 헤더 */}
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 dark:text-white">
                태그 관리
              </h1>
            </div>
            <Link
              href="/admin"
              className="text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              대시보드로 돌아가기
            </Link>
          </div>

          <TagManagementContainer />
        </motion.div>
      </div>
    </div>
  );
}
