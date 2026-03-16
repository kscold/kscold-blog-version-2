'use client';

import { motion } from 'framer-motion';
import AdminChatView from '@/features/chat/ui/AdminChatView';

export default function AdminChatPage() {
  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-surface-900">채팅 관리</h1>
            <p className="text-surface-500 mt-1 text-sm">방문자 실시간 채팅 메시지를 조회합니다.</p>
          </div>
          <AdminChatView />
        </motion.div>
      </div>
    </div>
  );
}
