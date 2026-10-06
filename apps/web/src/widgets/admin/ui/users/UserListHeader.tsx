'use client';

import { AdminPageHeader } from '@/shared/ui/AdminPage';

interface Props {
  total: number;
  search: string;
  onSearchChange: (value: string) => void;
}

export function UserListHeader({ total, search, onSearchChange }: Props) {
  return (
    <AdminPageHeader
      eyebrow="Users"
      title="사용자 관리"
      description={`가입한 사용자 ${total}명의 프로필과 계정 상태를 관리합니다.`}
      actions={
        <input
          value={search}
          onChange={event => onSearchChange(event.target.value)}
          placeholder="이름, 이메일 검색"
          aria-label="사용자 검색"
          className="w-56 rounded-[10px] border border-surface-200 bg-white px-3 py-2.5 text-sm focus:border-surface-400 focus:outline-none"
        />
      }
    />
  );
}
