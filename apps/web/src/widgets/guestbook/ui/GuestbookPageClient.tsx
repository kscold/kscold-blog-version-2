'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  useCreateGuestbookEntry,
  useDeleteGuestbookEntry,
  useGuestbookEntries,
} from '@/entities/guestbook/api/useGuestbook';
import { useAuth } from '@/features/auth/api/useAuth';
import { useAlert } from '@/shared/model/alertStore';
import { GuestbookHero } from '@/widgets/guestbook/ui/guestbook-page/GuestbookHero';
import { GuestbookComposerCard } from '@/widgets/guestbook/ui/guestbook-page/GuestbookComposerCard';
import { GuestbookEntriesSection } from '@/widgets/guestbook/ui/guestbook-page/GuestbookEntriesSection';

export function GuestbookPageClient() {
  const [page, setPage] = useState(0);
  const [content, setContent] = useState('');
  const { currentUser, isAuthenticated } = useAuth();
  const { data, isLoading } = useGuestbookEntries(page, 12);
  const createEntry = useCreateGuestbookEntry();
  const deleteEntry = useDeleteGuestbookEntry();
  const alert = useAlert();

  const entries = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const remainingCharacters = useMemo(() => 500 - content.length, [content.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await createEntry.mutateAsync({ content: content.trim() });
      setContent('');
      alert.success('방명록을 남겼습니다');
      setPage(0);
    } catch (err) {
      const message = err instanceof Error ? err.message : '방명록 작성에 실패했습니다';
      alert.error(message);
    }
  };

  const handleDelete = async (entryId: string) => {
    try {
      await deleteEntry.mutateAsync(entryId);
      alert.success('방명록을 삭제했습니다');
    } catch (err) {
      const message = err instanceof Error ? err.message : '방명록 삭제에 실패했습니다';
      alert.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          className="grid gap-6 xl:grid-cols-[minmax(0,0.98fr)_minmax(0,1.02fr)]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <GuestbookHero
            isAuthenticated={isAuthenticated}
            totalEntries={data?.totalElements ?? 0}
          />

          <section className="rounded-[2rem] border border-surface-200 bg-white p-5 shadow-sm sm:p-6">
            <GuestbookComposerCard
              content={content}
              currentUser={currentUser}
              isAuthenticated={isAuthenticated}
              isSubmitting={createEntry.isPending}
              remainingCharacters={remainingCharacters}
              onChangeContent={setContent}
              onSubmit={handleSubmit}
            />

            <div className="mt-5 space-y-4">
              <GuestbookEntriesSection
                entries={entries}
                isLoading={isLoading}
                page={page}
                totalPages={totalPages}
                onDelete={handleDelete}
                onPageChange={setPage}
              />
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
