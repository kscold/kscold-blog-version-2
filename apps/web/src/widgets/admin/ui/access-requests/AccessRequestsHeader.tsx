import { AdminPageHeader } from '@/shared/ui/AdminPage';

interface AccessRequestsHeaderProps {
  requestCount: number;
}

export function AccessRequestsHeader({ requestCount }: AccessRequestsHeaderProps) {
  return (
    <AdminPageHeader
      eyebrow="Access"
      title="열람 요청 관리"
      description="제한 글 열람 요청을 검토하고, 요청한 글만 열지 카테고리 전체를 열지 범위를 선택해 승인할 수 있습니다."
      actions={
        <span className="inline-flex w-fit rounded-full bg-surface-900 px-3 py-1.5 text-sm font-bold text-white">
          {requestCount}건 대기
        </span>
      }
    />
  );
}
