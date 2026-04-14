'use client';

import { motion } from 'framer-motion';
import { AdminNightAdminSection } from '@/widgets/admin-night/ui/admin/AdminNightAdminSection';

export default function AdminNightAdminPage() {
  return (
    <div className="min-h-screen bg-surface-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <AdminNightAdminSection />
        </motion.div>
      </div>
    </div>
  );
}
