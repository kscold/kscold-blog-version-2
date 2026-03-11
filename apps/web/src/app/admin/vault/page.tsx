'use client';

import { AdminVaultContainer } from '@/widgets/admin/ui/AdminVaultContainer';

export default function AdminVaultPage() {
  return (
    <div className="min-h-screen bg-secondary-beige dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminVaultContainer />
      </div>
    </div>
  );
}
