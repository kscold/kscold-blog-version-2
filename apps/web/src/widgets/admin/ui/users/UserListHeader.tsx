'use client';

interface Props {
  total: number;
  search: string;
  onSearchChange: (value: string) => void;
}

export function UserListHeader({ total, search, onSearchChange }: Props) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-surface-900">전체 사용자</h1>
        <p className="text-sm text-surface-500 mt-0.5">총 {total}명</p>
      </div>
      <input
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        placeholder="이름, 이메일 검색"
        className="px-3 py-2 text-sm border border-surface-200 rounded-xl focus:outline-none focus:border-surface-400 w-52"
      />
    </div>
  );
}
