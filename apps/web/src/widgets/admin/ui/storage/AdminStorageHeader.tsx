import Button from '@/shared/ui/Button';

interface AdminStorageHeaderProps {
  bucket?: string;
  disabled: boolean;
  onRefresh: () => void;
}

export function AdminStorageHeader({
  bucket,
  disabled,
  onRefresh,
}: AdminStorageHeaderProps) {
  return (
    <div className="mb-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-sans font-black tracking-tighter text-surface-900 sm:text-4xl">
              Storage
            </h1>
            <span className="rounded-full border border-surface-200 bg-white px-3 py-1 text-xs font-semibold text-surface-600">
              {bucket || 'blog'} bucket
            </span>
          </div>
          <p className="max-w-3xl text-sm leading-6 text-surface-500 sm:text-base">
            MinIO 콘솔을 열지 않고도 이 사이트에 연결된 `blog` 버킷만 살펴보고, 업로드와
            정리 작업을 진행할 수 있는 어드민 전용 페이지입니다.
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onRefresh()}
          data-cy="admin-storage-refresh"
        >
          새로고침
        </Button>
      </div>
    </div>
  );
}
