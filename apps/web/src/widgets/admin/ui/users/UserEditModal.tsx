'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAdminUpdateProfile, AdminUser, useTechStacks } from '@/features/profile';
import { TechStackSelector } from '@/shared/ui/TechStackSelector';
import { useAlert } from '@/shared/model/alertStore';

export function UserEditModal({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [bio, setBio] = useState(user.bio || '');
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [techStack, setTechStack] = useState<string[]>(user.techStack || []);
  const { data: sharedStacks } = useTechStacks();
  const updateProfile = useAdminUpdateProfile();
  const alert = useAlert();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({ userId: user.id, data: { displayName, bio, avatar, techStack } });
      alert.success('프로필이 업데이트되었습니다.');
      onClose();
    } catch {
      alert.error('업데이트에 실패했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <motion.div
        className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-surface-900">{user.username} 프로필 편집</h2>
          <button onClick={onClose} className="text-surface-400 hover:text-surface-900 transition-colors text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1">표시 이름</label>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full px-3 py-2 text-sm border border-surface-200 rounded-xl focus:outline-none focus:border-surface-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1">소개</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={2} className="w-full px-3 py-2 text-sm border border-surface-200 rounded-xl focus:outline-none focus:border-surface-400 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1">아바타 URL</label>
            <input value={avatar} onChange={e => setAvatar(e.target.value)} className="w-full px-3 py-2 text-sm border border-surface-200 rounded-xl focus:outline-none focus:border-surface-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-600 mb-2">기술 스택</label>
            <TechStackSelector value={techStack} sharedStacks={sharedStacks} onChange={setTechStack} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-surface-600 hover:text-surface-900 transition-colors">취소</button>
            <button type="submit" disabled={updateProfile.isPending} className="px-5 py-2 text-sm font-bold bg-surface-900 text-white rounded-xl hover:bg-surface-700 transition-colors disabled:opacity-50">
              {updateProfile.isPending ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
