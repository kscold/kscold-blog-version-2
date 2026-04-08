import type { FormEvent } from 'react';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';

interface AdminStorageFolderPanelProps {
  folderName: string;
  isMutating: boolean;
  isCreatingFolder: boolean;
  onFolderNameChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function AdminStorageFolderPanel({
  folderName,
  isMutating,
  isCreatingFolder,
  onFolderNameChange,
  onSubmit,
}: AdminStorageFolderPanelProps) {
  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-5">
      <h2 className="text-lg font-bold text-surface-900">폴더 만들기</h2>
      <form className="mt-4 space-y-3" onSubmit={event => void onSubmit(event)}>
        <Input
          value={folderName}
          onChange={event => onFolderNameChange(event.target.value)}
          placeholder="예: hero-images"
          helperText="현재 경로 아래에 새 폴더를 만듭니다."
          disabled={isMutating}
          data-cy="admin-storage-folder-input"
        />
        <Button
          type="submit"
          size="sm"
          disabled={isMutating || !folderName.trim()}
          isLoading={isCreatingFolder}
          data-cy="admin-storage-folder-submit"
        >
          폴더 생성
        </Button>
      </form>
    </div>
  );
}
