import Button from '@/shared/ui/Button';
import {
  formatStorageBytes,
  formatStorageTime,
  type AdminStorageListing,
} from '@/widgets/admin/lib/adminStorage';

interface AdminStorageBrowserProps {
  listing: AdminStorageListing | null;
  currentPrefix: string;
  selectedObjectKey: string | null;
  isLoading: boolean;
  isMutating: boolean;
  onNavigate: (prefix: string) => void;
  onDeleteEntry: (key: string, label: string) => Promise<void>;
  onSelectObject: (key: string) => void;
}

export function AdminStorageBrowser({
  listing,
  currentPrefix,
  selectedObjectKey,
  isLoading,
  isMutating,
  onNavigate,
  onDeleteEntry,
  onSelectObject,
}: AdminStorageBrowserProps) {
  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="max-w-2xl space-y-2">
          <h2 className="text-lg font-bold text-surface-900">탐색기</h2>
          <p className="text-sm leading-6 text-surface-500">
            폴더를 열어 이동하고, 파일을 선택해 미리보기와 다운로드를 이어서 확인할 수
            있습니다.
          </p>
        </div>
        {currentPrefix ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onNavigate(listing?.parentPrefix || '')}
            disabled={isLoading || isMutating}
            data-cy="admin-storage-up"
          >
            상위로
          </Button>
        ) : null}
      </div>

      <div className="mt-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-surface-400">폴더</div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {listing?.folders.length ? (
            listing.folders.map(folder => (
              <div
                key={folder.key}
                className="rounded-2xl border border-surface-200 bg-surface-50 px-4 py-4"
              >
                <button
                  type="button"
                  onClick={() => onNavigate(folder.key)}
                  className="w-full text-left"
                  data-cy={`admin-storage-folder-${folder.name}`}
                >
                  <div className="text-sm font-semibold leading-6 text-surface-900 [overflow-wrap:anywhere]">
                    {folder.name}
                  </div>
                  <div className="mt-1 text-xs leading-5 text-surface-500 [overflow-wrap:anywhere]">
                    {folder.key}
                  </div>
                </button>
                <div className="mt-3 flex items-center gap-2">
                  <Button type="button" size="sm" variant="ghost" onClick={() => onNavigate(folder.key)}>
                    열기
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    disabled={isMutating}
                    onClick={() => void onDeleteEntry(folder.key, folder.name)}
                    data-cy={`admin-storage-delete-folder-${folder.name}`}
                  >
                    삭제
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-surface-200 bg-surface-50 px-5 py-8 text-sm text-surface-400">
              현재 경로에 폴더가 없습니다.
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <div className="text-xs font-semibold uppercase tracking-wide text-surface-400">파일</div>
        <div className="mt-3 overflow-hidden rounded-2xl border border-surface-200">
          <div className="hidden gap-3 bg-surface-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-surface-400 md:grid md:grid-cols-[1.4fr_0.7fr_0.8fr_0.9fr]">
            <span>이름</span>
            <span>크기</span>
            <span>수정 시각</span>
            <span>관리</span>
          </div>

          {listing?.objects.length ? (
            <div className="divide-y divide-surface-100 bg-white">
              {listing.objects.map(object => {
                const previewUrl = `/api/admin/storage/object?key=${encodeURIComponent(object.key)}`;
                const downloadUrl = `${previewUrl}&download=1`;
                const isSelected = selectedObjectKey === object.key;

                return (
                  <div
                    key={object.key}
                    className={`grid grid-cols-1 gap-3 px-4 py-4 md:grid-cols-[1.4fr_0.7fr_0.8fr_0.9fr] ${
                      isSelected ? 'bg-surface-50' : 'bg-white'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectObject(object.key)}
                      className="text-left"
                      data-cy={`admin-storage-object-${object.name}`}
                    >
                      <div className="text-sm font-semibold leading-6 text-surface-900 [overflow-wrap:anywhere]">
                        {object.name}
                      </div>
                      <div className="mt-1 text-xs leading-5 text-surface-500 [overflow-wrap:anywhere]">
                        {object.key}
                      </div>
                    </button>
                    <div className="text-sm text-surface-500">{formatStorageBytes(object.size)}</div>
                    <div className="text-sm text-surface-500">
                      {formatStorageTime(object.lastModified)}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-surface-700 hover:text-surface-900"
                      >
                        열기
                      </a>
                      <a
                        href={downloadUrl}
                        className="text-sm font-semibold text-surface-700 hover:text-surface-900"
                      >
                        다운로드
                      </a>
                      <button
                        type="button"
                        onClick={() => void onDeleteEntry(object.key, object.name)}
                        className="text-sm font-semibold text-red-600 hover:text-red-700"
                        data-cy={`admin-storage-delete-object-${object.name}`}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white px-5 py-10 text-center text-sm text-surface-400">
              현재 경로에 파일이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
