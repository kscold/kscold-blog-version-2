import Link from 'next/link';

export function AdminNightRequestGuestPrompt() {
  return (
    <div className="rounded-[24px] border border-surface-200 bg-surface-50 p-5">
      <p className="text-sm leading-7 text-surface-500">
        Admin Night 신청은 로그인한 상태에서 보낼 수 있습니다. 로그인 후 오늘 끝낼 일과 원하는 시간대를
        남기면, 확인 뒤 일정이 캘린더에 merge 됩니다.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/login?redirect=%2Fadmin-night"
          data-cy="admin-night-request-login"
          className="inline-flex items-center justify-center rounded-2xl bg-surface-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-surface-800"
        >
          로그인하고 신청하기
        </Link>
        <Link
          href="/guestbook"
          className="inline-flex items-center justify-center rounded-2xl border border-surface-200 bg-white px-5 py-3 text-sm font-bold text-surface-900 transition-colors hover:bg-surface-50"
        >
          방명록에 한 줄 남기기
        </Link>
      </div>
    </div>
  );
}
