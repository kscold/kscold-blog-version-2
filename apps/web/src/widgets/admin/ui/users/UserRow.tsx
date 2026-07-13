'use client';

import { motion } from 'framer-motion';
import type { AdminUser } from '@/features/profile';
import { UserAvatar } from './UserAvatar';

interface Props {
  user: AdminUser;
  onEdit: (user: AdminUser) => void;
  onSoftDelete: (user: AdminUser) => void;
  onHardDelete: (user: AdminUser) => void;
}

export function UserRow({ user, onEdit, onSoftDelete, onHardDelete }: Props) {
  return (
    <motion.div
      className={`flex items-center gap-4 bg-white border rounded-2xl px-4 py-3 ${user.deleted ? 'border-red-100 opacity-60' : 'border-surface-200'}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <UserAvatar user={user} />
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
          onClick={() => onEdit(user)}
          className="p-2 text-surface-400 hover:text-surface-900 hover:bg-surface-50 rounded-lg transition-colors"
          title="편집"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        {!user.deleted && (
          <button
            onClick={() => onSoftDelete(user)}
            className="p-2 text-surface-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="비활성화"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </button>
        )}
        <button
          onClick={() => onHardDelete(user)}
          className="p-2 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="영구 삭제"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}
