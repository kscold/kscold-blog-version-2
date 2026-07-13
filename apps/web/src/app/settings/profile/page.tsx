'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/features/auth';
import { ProfileSettingsForm } from '@/widgets/settings';

export default function ProfileSettingsPage() {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !currentUser) router.replace('/login');
  }, [isLoading, currentUser, router]);

  if (isLoading || !currentUser) return null;

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-sans font-black tracking-tighter text-surface-900 mb-1">
            프로필 설정
          </h1>
          <p className="text-sm text-surface-500">프로필 사진, 소개, 기술 스택 등을 관리합니다.</p>
        </motion.div>
        <ProfileSettingsForm />
      </div>
    </div>
  );
}
