import Link from 'next/link';
import { ADMIN_NIGHT_HERO_PARAGRAPHS, ADMIN_NIGHT_HERO_TITLE, ADMIN_NIGHT_KEYWORDS } from '@/widgets/admin-night/lib/adminNight';

export function AdminNightHeroSection() {
  return (
    <section className="rounded-[32px] border border-surface-200 bg-white px-6 py-8 shadow-sm sm:px-8 sm:py-10">
      <div className="max-w-4xl space-y-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-surface-400">Admin Night</p>
        <h1 className="text-4xl font-black tracking-tight text-surface-900 sm:text-5xl">{ADMIN_NIGHT_HERO_TITLE}</h1>
        <div className="space-y-3 text-base leading-8 text-surface-500 sm:text-lg">
          {ADMIN_NIGHT_HERO_PARAGRAPHS.map(paragraph => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {ADMIN_NIGHT_KEYWORDS.map(keyword => (
            <span
              key={keyword}
              className="rounded-full border border-surface-200 bg-surface-50 px-3 py-1.5 text-xs font-bold text-surface-600"
            >
              {keyword}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="#admin-night-request"
            data-cy="admin-night-hero-primary"
            className="inline-flex items-center justify-center rounded-2xl bg-surface-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-surface-800"
          >
            Admin Night 신청 보내기
          </Link>
          <Link
            href="/guestbook"
            data-cy="admin-night-hero-secondary"
            className="inline-flex items-center justify-center rounded-2xl border border-surface-200 bg-white px-6 py-3 text-sm font-bold text-surface-900 transition-colors hover:bg-surface-50"
          >
            방명록에 한 줄 남기기
          </Link>
        </div>
      </div>
    </section>
  );
}
