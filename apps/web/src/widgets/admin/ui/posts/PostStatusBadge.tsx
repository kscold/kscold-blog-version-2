const STATUS = {
  PUBLISHED: { label: '발행됨', className: 'bg-emerald-50 text-emerald-700' },
  DRAFT: { label: '초안', className: 'bg-amber-50 text-amber-700' },
  ARCHIVED: { label: '보관됨', className: 'bg-surface-100 text-surface-600' },
} as const;

export function PostStatusBadge({ status }: { status: string }) {
  const badge = STATUS[status as keyof typeof STATUS] ?? STATUS.ARCHIVED;
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${badge.className}`}
    >
      {badge.label}
    </span>
  );
}
