'use client';

import Image from 'next/image';
import type { AdminUser } from '@/features/profile';

export function UserAvatar({ user }: { user: AdminUser }) {
  const initials = (user.displayName || user.username || '?')[0].toUpperCase();
  const colors = ['bg-blue-100 text-blue-700', 'bg-violet-100 text-violet-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700'];
  const color = colors[user.username.charCodeAt(0) % colors.length];
  if (user.avatar) {
    return <Image src={user.avatar} alt="" width={36} height={36} className="w-9 h-9 rounded-full object-cover shrink-0" />;
  }
  return <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${color}`}>{initials}</div>;
}
