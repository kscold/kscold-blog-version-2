'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAdminUsers, useAdminUpdateProfile, AdminUser, UpdateProfilePayload } from '@/features/profile';
import { useSoftDeleteUser, useHardDeleteUser } from '@/features/user/api/useUserMutations';
import { useTechStacks } from '@/features/profile';
import { TechStackSelector } from '@/shared/ui/TechStackSelector';
import { useAlert } from '@/shared/model/alertStore';

function Avatar({ user }: { user: AdminUser }) {
  const initials = (user.displayName || user.username || '?')[0].toUpperCase();
  const colors = ['bg-blue-100 text-blue-700', 'bg-violet-100 text-violet-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700'];
  const color = colors[user.username.charCodeAt(0) % colors.length];
  if (user.avatar) {
    return <Image src={user.avatar} alt="" width={36} height={36} className="w-9 h-9 rounded-full object-cover shrink-0" />;
  }
  return <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${color}`}>{initials}</div>;
}

function EditModal({ user, onClose }: { user: AdminUser; onClose: () => void }) {
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

export function AdminUsersContainer() {
  const { data: users, isLoading } = useAdminUsers();
  const softDelete = useSoftDeleteUser();
  const hardDelete = useHardDeleteUser();
  const alert = useAlert();
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [search, setSearch] = useState('');

  const filtered = (users || []).filter(u =>
    !search || u.username.includes(search) || u.email.includes(search) || u.displayName?.includes(search)
  );

  const handleSoftDelete = async (user: AdminUser) => {
    if (!confirm(`${user.username} 계정을 비활성화하시겠습니까?`)) return;
    try {
      await softDelete.mutateAsync(user.id);
      alert.success('계정이 비활성화되었습니다.');
    } catch { alert.error('실패했습니다.'); }
  };

  const handleHardDelete = async (user: AdminUser) => {
    if (!confirm(`${user.username} 계정을 영구 삭제하시겠습니까? 복구 불가능합니다.`)) return;
    try {
      await hardDelete.mutateAsync(user.id);
      alert.success('계정이 영구 삭제되었습니다.');
    } catch { alert.error('실패했습니다.'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-surface-900">전체 사용자</h1>
          <p className="text-sm text-surface-500 mt-0.5">총 {users?.length ?? 0}명</p>
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="이름, 이메일 검색"
          className="px-3 py-2 text-sm border border-surface-200 rounded-xl focus:outline-none focus:border-surface-400 w-52"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-surface-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(user => (
            <motion.div
              key={user.id}
              className={`flex items-center gap-4 bg-white border rounded-2xl px-4 py-3 ${user.deleted ? 'border-red-100 opacity-60' : 'border-surface-200'}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Avatar user={user} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-surface-900">{user.displayName || user.username}</span>
                  <span className="text-xs text-surface-400">@{user.username}</span>
                  {user.role === 'ADMIN' && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-surface-900 text-white rounded-full">ADMIN</span>
                  )}
                  {user.deleted && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-600 rounded-full">비활성</span>
                  )}
                </div>
                <p className="text-xs text-surface-400 truncate">{user.email}</p>
                {user.techStack && user.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {user.techStack.slice(0, 5).map(t => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 bg-surface-100 text-surface-600 rounded-full">{t}</span>
                    ))}
                    {user.techStack.length > 5 && <span className="text-[10px] text-surface-400">+{user.techStack.length - 5}</span>}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setEditUser(user)}
                  className="p-2 text-surface-400 hover:text-surface-900 hover:bg-surface-50 rounded-lg transition-colors"
                  title="편집"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                {!user.deleted && (
                  <button
                    onClick={() => handleSoftDelete(user)}
                    className="p-2 text-surface-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    title="비활성화"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => handleHardDelete(user)}
                  className="p-2 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="영구 삭제"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {editUser && <EditModal user={editUser} onClose={() => setEditUser(null)} />}
    </div>
  );
}
