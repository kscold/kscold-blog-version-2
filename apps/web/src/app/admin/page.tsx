'use client';

import { motion } from 'framer-motion';
import { AdminDashboardContainer } from '@/widgets/admin/ui/AdminDashboardContainer';

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <AdminDashboardContainer />
        </motion.div>
      </div>
    </div>
  );
}
