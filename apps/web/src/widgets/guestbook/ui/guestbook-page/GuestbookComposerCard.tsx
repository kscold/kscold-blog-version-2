import Link from 'next/link';
import type { User } from '@/types/user';

interface GuestbookComposerCardProps {
  content: string;
  currentUser: User | null | undefined;
  isAuthenticated: boolean;
  isSubmitting: boolean;
  remainingCharacters: number;
  onChangeContent: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
}

export function GuestbookComposerCard({
  content,
  currentUser,
  isAuthenticated,
  isSubmitting,
  remainingCharacters,
  onChangeContent,
  onSubmit,
}: GuestbookComposerCardProps) {
  return (
    <div className="rounded-[1.5rem] bg-surface-900 px-5 py-5 text-white sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
        Leave A Note
      </p>
      {isAuthenticated && currentUser ? (
        <>
          <p className="mt-3 text-sm leading-6 text-white/80">
            <span className="font-semibold text-white">{currentUser.displayName}</span>님,
            인사 한 줄이나 간단한 버그, 피드백을 남겨주세요.
          </p>
          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            <textarea
              data-cy="guestbook-textarea"
              value={content}
              onChange={event => onChangeContent(event.target.value)}
              placeholder="잘 보고 갑니다, 다음 글도 기대할게요, 이 부분은 조금 어색했어요 같은 짧은 메모면 충분해요."
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
                disabled={isSubmitting || !content.trim()}
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-bold text-surface-900 transition-colors hover:bg-surface-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? '남기는 중...' : '방명록 남기기'}
              </button>
            </div>
          </form>
        </>
      ) : (
        <div className="mt-4 space-y-4">
          <p className="text-sm leading-6 text-white/80">
            짧은 인사 한 줄도 괜찮고, 읽으면서 느낀 점이나 간단한 버그, 피드백도 좋아요. 로그인하면 바로 남길 수 있어요.
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
  );
}
