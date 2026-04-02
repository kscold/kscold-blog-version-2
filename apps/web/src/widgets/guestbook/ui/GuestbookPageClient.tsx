'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  useCreateGuestbookEntry,
  useDeleteGuestbookEntry,
  useGuestbookEntries,
} from '@/entities/guestbook/api/useGuestbook';
import { useAuth } from '@/features/auth/api/useAuth';
import { formatDateTime, formatRelativeTime } from '@/shared/lib/format-utils';
import { useAlert } from '@/shared/model/alertStore';
import { Pagination } from '@/shared/ui/Pagination';

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
          className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <section className="rounded-[2rem] border border-surface-200 bg-white px-6 py-7 shadow-sm sm:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-surface-400">
              Guestbook
            </p>
            <h1 className="mt-3 text-4xl font-sans font-black tracking-tighter text-surface-900 sm:text-5xl">
              <span data-cy="guestbook-title">방명록을 남겨주세요!</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-surface-600 sm:text-base">
              지나간 자리에서 떠오른 생각 한 줄이면 충분합니다. 짧은 인사도 좋고,
              읽고 간 글에 대한 감상이나 다음에 보고 싶은 주제를 남겨주셔도 좋아요.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-surface-200 bg-surface-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-surface-400">Entries</p>
                <p className="mt-2 text-2xl font-black tracking-tight text-surface-900">{data?.totalElements ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-surface-200 bg-surface-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-surface-400">Posting</p>
                <p className="mt-2 text-sm font-semibold text-surface-800">
                  {isAuthenticated ? '지금 바로 남길 수 있어요' : '로그인 후 바로 남길 수 있어요'}
                </p>
              </div>
              <div className="rounded-2xl border border-surface-200 bg-surface-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-surface-400">Moderation</p>
                <p className="mt-2 text-sm font-semibold text-surface-800">작성한 글은 직접 정리할 수 있어요</p>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-surface-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="rounded-[1.5rem] bg-surface-900 px-5 py-5 text-white sm:px-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
                Leave A Note
              </p>
              {isAuthenticated && currentUser ? (
                <>
                  <p className="mt-3 text-sm leading-6 text-white/80">
                    <span className="font-semibold text-white">{currentUser.displayName}</span>님,
                    오늘의 한 줄을 남겨주세요.
                  </p>
                  <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                    <textarea
                      data-cy="guestbook-textarea"
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      placeholder="반가웠어요, 잘 보고 갑니다, 다음 글도 기대할게요 같은 한 줄이면 충분해요."
                      maxLength={500}
                      rows={6}
                      className="min-h-[160px] w-full resize-y rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm leading-6 text-white placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-white/30"
                      required
                    />
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-white/55">{remainingCharacters}자 남음</p>
                      <button
                        type="submit"
                        data-cy="guestbook-submit"
                        disabled={createEntry.isPending || !content.trim()}
                        className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-bold text-surface-900 transition-colors hover:bg-surface-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {createEntry.isPending ? '남기는 중...' : '방명록 남기기'}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="mt-4 space-y-4">
                  <p className="text-sm leading-6 text-white/80">
                    짧은 인사 한 줄도 괜찮아요. 로그인하면 바로 방명록을 남길 수 있어요.
                  </p>
                  <Link
                    href="/login?redirect=%2Fguestbook"
                    data-cy="guestbook-login-cta"
                    className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-bold text-surface-900 transition-colors hover:bg-surface-100"
                  >
                    로그인하고 남기기
                  </Link>
                </div>
              )}
            </div>

            <div className="mt-5 space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="h-28 animate-pulse rounded-3xl bg-surface-100" />
                  ))}
                </div>
              ) : entries.length > 0 ? (
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
                              onClick={() => handleDelete(entry.id)}
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

                  <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                </>
              ) : (
                <div className="rounded-3xl border border-dashed border-surface-200 bg-surface-50 px-6 py-12 text-center">
                  <div data-cy="guestbook-empty-state">
                    <p className="text-sm font-semibold text-surface-700">첫 번째 인사를 남겨주세요.</p>
                    <p className="mt-2 text-sm text-surface-500">
                      길게 쓰지 않아도 괜찮아요. 짧은 감상이나 반가운 한 줄이면 충분합니다.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
