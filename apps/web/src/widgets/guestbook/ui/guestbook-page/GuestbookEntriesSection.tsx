import { Pagination } from '@/shared/ui/Pagination';
import type { GuestbookEntry } from '@/shared/model/types/guestbook';
import { GuestbookEntryCard } from './GuestbookEntryCard';

interface GuestbookEntriesSectionProps {
  entries: GuestbookEntry[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  isAdmin: boolean;
  isReplying: boolean;
  onDelete: (entryId: string) => void;
  onReply: (entryId: string, content: string) => Promise<void>;
  onPageChange: (page: number) => void;
}

export function GuestbookEntriesSection({
  entries,
  isLoading,
  page,
  totalPages,
  isAdmin,
  isReplying,
  onDelete,
  onReply,
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
          <GuestbookEntryCard
            key={entry.id}
            entry={entry}
            isAdmin={isAdmin}
            isReplying={isReplying}
            onDelete={onDelete}
            onReply={onReply}
          />
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </>
  );
}
