'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FeedComposer } from '@/components/feed/FeedComposer';

export default function NewFeedPage() {
  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-xl mx-auto px-4 py-8">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/admin/feed"
            className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-900 transition-colors font-medium mb-4"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            피드 관리로 돌아가기
          </Link>
          <h1 className="text-3xl font-sans font-black tracking-tighter text-surface-900">
            새 피드 작성
          </h1>
        </motion.div>

        <FeedComposer />
      </div>
    </div>
  );
}
