'use client';

import { motion } from 'framer-motion';
import { FeedList } from '@/widgets/feed/ui/FeedList';

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-sans font-black tracking-tighter text-surface-900 mb-2">
            Feed
          </h1>
          <p className="text-sm text-surface-500 font-medium">일상, 개발, 그리고 생각의 조각들</p>
        </motion.div>

        {/* 피드 타임라인 */}
        <FeedList />
      </div>
    </div>
  );
}
