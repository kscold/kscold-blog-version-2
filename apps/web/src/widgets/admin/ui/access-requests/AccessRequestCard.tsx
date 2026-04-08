import type { AccessRequest, GrantScope } from '@/widgets/admin/model/useAccessRequests';

interface AccessRequestCardProps {
  request: AccessRequest;
  selectedScope: GrantScope;
  onSelectScope: (requestId: string, scope: GrantScope) => void;
  onHandle: (request: AccessRequest, action: 'approve' | 'reject') => void;
}

export function AccessRequestCard({
  request,
  selectedScope,
  onSelectScope,
  onHandle,
}: AccessRequestCardProps) {
  return (
    <div
      data-cy={`access-request-${request.id}`}
      className="grid gap-4 rounded-2xl border border-surface-200 bg-white p-5 lg:grid-cols-[minmax(0,1fr)_320px]"
    >
      <div className="min-w-0 space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-surface-900">{request.username}</p>
          <p className="text-xs text-surface-400">
            요청일 · {new Date(request.createdAt).toLocaleDateString('ko-KR')}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-surface-100 bg-surface-50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-surface-400">
              글
            </p>
            <p className="mt-2 text-sm font-medium leading-6 text-surface-800 [overflow-wrap:anywhere]">
              {request.postTitle || '기존 카테고리 요청'}
            </p>
          </div>
          <div className="rounded-xl border border-surface-100 bg-surface-50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-surface-400">
              카테고리
            </p>
            <p className="mt-2 text-sm font-medium leading-6 text-surface-800 [overflow-wrap:anywhere]">
              {request.categoryName}
            </p>
          </div>
        </div>

        {request.message && (
          <div className="rounded-xl border border-surface-100 bg-surface-50/80 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-surface-400">
              메시지
            </p>
            <p className="mt-2 text-sm leading-6 text-surface-500 [overflow-wrap:anywhere]">
              &quot;{request.message}&quot;
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-surface-100 bg-surface-50 p-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-surface-500">승인 범위</p>
          <div className="grid gap-2">
            <button
              type="button"
              data-cy={`access-request-${request.id}-scope-post`}
              onClick={() => onSelectScope(request.id, 'POST')}
              disabled={!request.postId}
              className={[
                'rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors',
                selectedScope === 'POST' ? 'bg-surface-900 text-white' : 'bg-white text-surface-700',
                !request.postId ? 'cursor-not-allowed opacity-40' : 'hover:bg-surface-200',
              ].join(' ')}
            >
              <span className="block">이 글만 승인</span>
              <span
                className={`mt-1 block text-xs leading-5 ${
                  selectedScope === 'POST' ? 'text-surface-300' : 'text-surface-400'
                }`}
              >
                현재 요청한 글 하나만 열람할 수 있게 합니다.
              </span>
            </button>
            <button
              type="button"
              data-cy={`access-request-${request.id}-scope-category`}
              onClick={() => onSelectScope(request.id, 'CATEGORY')}
              className={[
                'rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors',
                selectedScope === 'CATEGORY'
                  ? 'bg-surface-900 text-white'
                  : 'bg-white text-surface-700 hover:bg-surface-200',
              ].join(' ')}
            >
              <span className="block">카테고리 전체 승인</span>
              <span
                className={`mt-1 block text-xs leading-5 ${
                  selectedScope === 'CATEGORY' ? 'text-surface-300' : 'text-surface-400'
                }`}
              >
                같은 카테고리의 제한 글 전체를 열람할 수 있게 합니다.
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            data-cy={`access-request-${request.id}-approve`}
            onClick={() => onHandle(request, 'approve')}
            className="rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-700"
          >
            승인
          </button>
          <button
            data-cy={`access-request-${request.id}-reject`}
            onClick={() => onHandle(request, 'reject')}
            className="rounded-xl bg-surface-200 px-4 py-3 text-sm font-semibold text-surface-700 transition-colors hover:bg-surface-300"
          >
            거절
          </button>
        </div>
      </div>
    </div>
  );
}
