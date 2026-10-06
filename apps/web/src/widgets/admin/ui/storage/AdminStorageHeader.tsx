import { AdminPageHeader } from '@/shared/ui/AdminPage';
import Button from '@/shared/ui/Button';

interface AdminStorageHeaderProps {
  bucket?: string;
  disabled: boolean;
  onRefresh: () => void;
}

export function AdminStorageHeader({ bucket, disabled, onRefresh }: AdminStorageHeaderProps) {
  return (
    <AdminPageHeader
      eyebrow="Storage"
      title="스토리지"
      description={`MinIO 콘솔을 열지 않고 이 사이트에 연결된 ${bucket || 'blog'} 버킷을 살펴보고, 업로드와 정리 작업을 진행합니다.`}
      actions={
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onRefresh()}
          data-testid="admin-storage-refresh"
        >
          새로고침
        </Button>
      }
    />
  );
}
