import type { ChangeEvent, DragEvent } from 'react';

interface AdminStorageUploadPanelProps {
  currentPrefix: string;
  selectedFilesLabel: string;
  isMutating: boolean;
  isUploading: boolean;
  onFileSelection: (event: ChangeEvent<HTMLInputElement>) => void;
  onFileDrop: (event: DragEvent<HTMLDivElement>) => void;
}

export function AdminStorageUploadPanel({
  currentPrefix,
  selectedFilesLabel,
  isMutating,
  isUploading,
  onFileSelection,
  onFileDrop,
}: AdminStorageUploadPanelProps) {
  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-5">
      <h2 className="text-lg font-bold text-surface-900">업로드</h2>
      <p className="mt-2 text-sm leading-6 text-surface-500">
        현재 경로에 이미지나 정적 파일을 바로 올릴 수 있습니다.
      </p>
      <div
        className="mt-4 rounded-2xl border border-dashed border-surface-200 bg-surface-50 px-5 py-5 text-center"
        onDragOver={event => event.preventDefault()}
        onDrop={event => void onFileDrop(event)}
        data-cy="admin-storage-dropzone"
      >
        <span className="text-sm font-semibold text-surface-900">파일 선택</span>
        <span
          className="mt-2 block text-xs leading-5 text-surface-500 [overflow-wrap:anywhere]"
          data-cy="admin-storage-selected-files"
        >
          {selectedFilesLabel}
        </span>
        <input
          id="admin-storage-upload"
          type="file"
          multiple
          className="mt-4 block w-full cursor-pointer rounded-xl border border-surface-200 bg-white px-3 py-2 text-sm text-surface-600 file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-surface-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-surface-700"
          onChange={onFileSelection}
          disabled={isMutating}
          data-cy="admin-storage-upload-input"
        />
        <div className="mt-3 text-xs text-surface-400">
          파일을 이 영역으로 바로 끌어와도 업로드할 수 있습니다.
        </div>
      </div>
      <div className="mt-3 text-xs leading-5 text-surface-400">
        업로드는 현재 경로 `{currentPrefix || '/'}`에 바로 반영됩니다.
      </div>
      {isUploading ? (
        <div className="mt-3 text-sm text-surface-500">파일을 업로드하는 중입니다.</div>
      ) : null}
    </div>
  );
}
