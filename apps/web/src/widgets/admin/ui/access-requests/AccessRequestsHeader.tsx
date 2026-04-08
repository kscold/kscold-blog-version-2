interface AccessRequestsHeaderProps {
  requestCount: number;
}

export function AccessRequestsHeader({ requestCount }: AccessRequestsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-surface-900 sm:text-3xl">
          열람 요청 관리
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-surface-500">
          제한 글 열람 요청을 검토하고, 요청한 글만 열지 카테고리 전체를 열지 범위를 선택해
          승인할 수 있습니다.
        </p>
      </div>
      <span className="inline-flex w-fit rounded-full bg-surface-100 px-3 py-1 text-sm font-medium text-surface-600">
        {requestCount}건 대기
      </span>
    </div>
  );
}
