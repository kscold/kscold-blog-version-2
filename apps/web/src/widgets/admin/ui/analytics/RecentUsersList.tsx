'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import type { RecentUser } from '@/entities/user/api/useUserStats';
import { useSoftDeleteUser, useHardDeleteUser } from '@/features/user/api/useUserMutations';
import { useAlert } from '@/shared/model/alertStore';
import { useAuth } from '@/features/auth';

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
];

function UserAvatar({ user }: { user: RecentUser }) {
  const initials = (user.displayName || user.username || '?')[0].toUpperCase();
  const color = AVATAR_COLORS[user.username.charCodeAt(0) % AVATAR_COLORS.length];

  if (user.avatar) {
    return (
      <Image
        src={user.avatar}
        alt={user.displayName || user.username}
        width={32}
        height={32}
        sizes="32px"
        className="w-8 h-8 rounded-full object-cover shrink-0"
      />
    );
  }
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${color}`}>
      {initials}
    </div>
  );
}

interface RecentUsersListProps {
  users: RecentUser[];
}

export function RecentUsersList({ users }: RecentUsersListProps) {
  const softDelete = useSoftDeleteUser();
  const hardDelete = useHardDeleteUser();
  const alert = useAlert();
  const { currentUser } = useAuth();

  const handleSoftDelete = async (user: RecentUser) => {
    if (!window.confirm(`${user.displayName || user.username}님의 계정을 비활성화하시겠어요?\n데이터는 보존되며 복구가 가능합니다.`)) return;
    try {
      await softDelete.mutateAsync(user.id);
      alert.success('계정을 비활성화했습니다');
    } catch {
      alert.error('비활성화에 실패했습니다');
    }
  };

  const handleHardDelete = async (user: RecentUser) => {
    const confirmText = `영구삭제/${user.username}`;
    const input = window.prompt(
      `⚠️ ${user.displayName || user.username} 계정을 DB에서 완전히 삭제합니다. 복구할 수 없습니다.\n계속하려면 "${confirmText}" 를 입력하세요.`
    );
    if (input !== confirmText) return;
    try {
      await hardDelete.mutateAsync(user.id);
      alert.success('계정을 영구 삭제했습니다');
    } catch {
      alert.error('영구 삭제에 실패했습니다');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white border border-surface-200 rounded-2xl overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-surface-100">
        <h3 className="text-sm font-bold text-surface-900">최근 가입자</h3>
      </div>
      <div className="divide-y divide-surface-50">
        {users.length === 0 ? (
          <p className="text-center py-8 text-sm text-surface-400">가입자가 없습니다</p>
        ) : (
          users.map(user => {
            const isSelf = currentUser?.id === user.id;
            return (
              <div key={user.id} className="flex items-center gap-3 px-5 py-3">
                <UserAvatar user={user} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-sm font-semibold truncate ${user.deleted ? 'text-surface-400 line-through' : 'text-surface-900'}`}>
                      {user.displayName || user.username}
                    </span>
                    {user.role === 'ADMIN' && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-full">
                        ADMIN
                      </span>
                    )}
                    {user.deleted && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-surface-200 text-surface-500 rounded-full">
                        비활성
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-surface-400 truncate">{user.email}</div>
                </div>
                <span className="text-xs text-surface-400 whitespace-nowrap shrink-0">
                  {user.createdAt}
                </span>
                {!isSelf && (
                  <div className="flex items-center gap-1 shrink-0">
                    {!user.deleted && (
                      <button
                        onClick={() => handleSoftDelete(user)}
                        disabled={softDelete.isPending}
                        className="px-2 py-1 text-[11px] font-medium text-surface-600 hover:bg-surface-100 rounded transition-colors disabled:opacity-50"
                        title="계정 비활성화 (복구 가능)"
                      >
                        비활성
                      </button>
                    )}
                    <button
                      onClick={() => handleHardDelete(user)}
                      disabled={hardDelete.isPending}
                      className="px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      title="계정 영구 삭제 (복구 불가)"
                    >
                      영구삭제
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
