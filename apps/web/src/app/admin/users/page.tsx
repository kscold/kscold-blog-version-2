'use client';

import { motion } from 'framer-motion';
import { AdminUsersContainer } from '@/widgets/admin';

export default function AdminUsersPage() {
  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <AdminUsersContainer />
        </motion.div>
      </div>
    </div>
  );
}
