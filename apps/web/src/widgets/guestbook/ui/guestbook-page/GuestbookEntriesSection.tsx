import { Pagination } from '@/shared/ui/Pagination';
import { formatDateTime, formatRelativeTime } from '@/shared/lib/format-utils';
import type { GuestbookEntry } from '@/types/guestbook';

interface GuestbookEntriesSectionProps {
  entries: GuestbookEntry[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onDelete: (entryId: string) => void;
  onPageChange: (page: number) => void;
}

export function GuestbookEntriesSection({
  entries,
  isLoading,
  page,
  totalPages,
  onDelete,
  onPageChange,
}: GuestbookEntriesSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-3xl bg-surface-100" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-surface-200 bg-surface-50 px-6 py-12 text-center">
        <div data-cy="guestbook-empty-state">
          <p className="text-sm font-semibold text-surface-700">첫 번째 인사를 남겨주세요.</p>
          <p className="mt-2 text-sm text-surface-500">
            길게 쓰지 않아도 괜찮아요. 짧은 감상이나 반가운 한 줄이면 충분합니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {entries.map(entry => (
          <article
            key={entry.id}
            data-cy="guestbook-entry"
            className="rounded-3xl border border-surface-200 bg-surface-50 px-5 py-4 shadow-[0_8px_30px_-24px_rgba(15,23,42,0.45)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-surface-900">{entry.authorName}</span>
                  {entry.isAdmin && (
                    <span className="rounded-full bg-surface-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                      Admin
                    </span>
                  )}
                </div>
                <p
                  className="mt-1 text-xs text-surface-400"
                  title={formatDateTime(entry.createdAt)}
                >
                  {formatRelativeTime(entry.createdAt)}
                </p>
              </div>

              {entry.canDelete && (
                <button
                  onClick={() => onDelete(entry.id)}
                  data-cy="guestbook-delete"
                  className="rounded-full border border-surface-200 px-3 py-1.5 text-xs font-semibold text-surface-500 transition-colors hover:border-red-200 hover:text-red-500"
                >
                  삭제
                </button>
              )}
            </div>

            <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-surface-700">
              {entry.content}
            </p>
          </article>
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </>
  );
}
