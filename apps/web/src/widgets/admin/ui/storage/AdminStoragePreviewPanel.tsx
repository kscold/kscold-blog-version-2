import Image from 'next/image';
import type { AdminStorageObject } from '@/widgets/admin/lib/adminStorage';
import { formatStorageBytes, formatStorageTime } from '@/widgets/admin/lib/adminStorage';

interface AdminStoragePreviewPanelProps {
  selectedObject: AdminStorageObject | null;
}

export function AdminStoragePreviewPanel({
  selectedObject,
}: AdminStoragePreviewPanelProps) {
  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-surface-900">선택한 파일</h2>
        {selectedObject?.publicUrl ? (
          <a
            href={selectedObject.publicUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-surface-700 hover:text-surface-900"
          >
            public URL
          </a>
        ) : null}
      </div>

      {selectedObject ? (
        <div className="mt-4">
          <div className="rounded-2xl border border-surface-100 bg-surface-50 p-4">
            {selectedObject.isImage ? (
              <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-xl border border-surface-200 bg-white">
                <Image
                  src={`/api/admin/storage/object?key=${encodeURIComponent(selectedObject.key)}`}
                  alt={selectedObject.name}
                  fill
                  unoptimized
                  className="object-contain"
                  sizes="(max-width: 1280px) 100vw, 420px"
                />
              </div>
            ) : (
              <div className="mb-4 rounded-xl border border-dashed border-surface-200 bg-white px-4 py-8 text-center text-sm text-surface-400">
                이미지가 아닌 파일은 새 탭에서 열거나 다운로드로 확인할 수 있습니다.
              </div>
            )}

            <div className="text-sm font-semibold leading-6 text-surface-900 [overflow-wrap:anywhere]">
              {selectedObject.name}
            </div>
            <div className="mt-1 text-xs leading-5 text-surface-500 [overflow-wrap:anywhere]">
              {selectedObject.key}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-surface-500">
              <div>
                <div className="text-xs uppercase tracking-wide text-surface-400">크기</div>
                <div className="mt-1">{formatStorageBytes(selectedObject.size)}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-surface-400">수정</div>
                <div className="mt-1">{formatStorageTime(selectedObject.lastModified)}</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-surface-200 bg-surface-50 px-5 py-8 text-sm text-surface-400">
          파일을 하나 선택하면 이곳에서 바로 내용을 확인할 수 있습니다.
        </div>
      )}
    </div>
  );
}
