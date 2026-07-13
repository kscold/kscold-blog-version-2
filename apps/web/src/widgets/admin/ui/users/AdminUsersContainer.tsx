'use client';

import { useState } from 'react';
import { useAdminUsers, AdminUser } from '@/features/profile';
import { useSoftDeleteUser, useHardDeleteUser } from '@/features/user';
import { useAlert } from '@/shared/model/alertStore';
import { UserListHeader } from './UserListHeader';
import { UserRow } from './UserRow';
import { UserEditModal } from './UserEditModal';

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
      <UserListHeader total={users?.length ?? 0} search={search} onSearchChange={setSearch} />

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-surface-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(user => (
            <UserRow
              key={user.id}
              user={user}
              onEdit={setEditUser}
              onSoftDelete={handleSoftDelete}
              onHardDelete={handleHardDelete}
            />
          ))}
        </div>
      )}

      {editUser && <UserEditModal user={editUser} onClose={() => setEditUser(null)} />}
    </div>
  );
}
