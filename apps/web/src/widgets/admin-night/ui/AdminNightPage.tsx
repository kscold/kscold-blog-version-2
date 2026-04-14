import Link from 'next/link';
import { PROFILE } from '@/entities/profile/model/profileData';
import {
  ADMIN_NIGHT_LINKS,
  ADMIN_NIGHT_STEPS,
  ADMIN_NIGHT_TAGS,
  buildAdminNightSlots,
} from '@/widgets/admin-night/lib/adminNight';
import { AdminNightCalendar } from './AdminNightCalendar';

function LinkCard() {
  return (
    <div className="space-y-4">
      <section className="rounded-[28px] border border-surface-200 bg-white p-5">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-surface-400">
            Culture Note
          </p>
          <h2 className="text-xl font-black tracking-tight text-surface-900">
            술 대신, 각자 끝낼 일을 들고 모이는 밤
          </h2>
        </div>
        <div className="mt-4 space-y-3 text-sm leading-7 text-surface-500">
          <p>
            Admin Night는 {PROFILE.name}과 같이 퇴근 후나 주말에 붙어서, 메일 답장, 블로그 초안, 작은 버그,
            문서 정리처럼 미뤄둔 일을 조용히 끝내는 문화 페이지입니다.
          </p>
          <p>
            오래 이야기하지 않아도 괜찮고, 같은 시간대에 각자 할 일을 한다는 감각만으로도 시작이 쉬워집니다.
            가능하면 마지막엔 기록이나 PR까지 남기는 걸 목표로 합니다.
          </p>
        </div>
      </section>

      <section className="rounded-[28px] border border-surface-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-surface-400">
              Join Flow
            </p>
            <h2 className="text-xl font-black tracking-tight text-surface-900">
              같이 붙는 방법
            </h2>
          </div>
        </div>

        <div className="space-y-3">
          {ADMIN_NIGHT_STEPS.map((step, index) => (
            <article key={step.id} className="rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-900 text-xs font-black text-white">
                  {index + 1}
                </span>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold leading-5 text-surface-900">{step.title}</h3>
                  <p className="text-xs leading-5 text-surface-500">{step.description}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-surface-200 bg-surface-900 p-5 text-white">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-surface-400">
            Participate
          </p>
          <h2 className="text-xl font-black tracking-tight">
            오늘 밤 바로 이어갈 수 있는 링크
          </h2>
        </div>

        <div className="mt-4 space-y-3">
          {ADMIN_NIGHT_LINKS.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              data-cy={`admin-night-link-${link.id}`}
              className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition-colors hover:bg-white/10"
            >
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-bold leading-5">{link.label}</p>
                <p className="text-xs leading-5 text-surface-300 [overflow-wrap:anywhere]">{link.detail}</p>
              </div>
              <span className="mt-1 text-sm text-surface-400">↗</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export function AdminNightPage() {
  const slots = buildAdminNightSlots(new Date());

  return (
    <main className="min-h-screen px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="overflow-hidden rounded-[32px] border border-surface-200 bg-white shadow-sm">
          <div className="border-b border-surface-200 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.08),_transparent_46%),linear-gradient(180deg,_rgba(248,250,252,0.96),_rgba(255,255,255,1))] px-5 py-8 sm:px-8 sm:py-10">
            <div className="max-w-4xl space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-surface-400">
                Admin Night
              </p>
              <h1 className="text-4xl font-black tracking-tight text-surface-900 sm:text-5xl">
                퇴근 후 같이 붙어,
                <br />
                각자 할 일을 끝내는 밤
              </h1>
              <p className="max-w-3xl text-base leading-8 text-surface-500 sm:text-lg">
                {PROFILE.name}이 퇴근 후나 주말에 열어두는 느슨한 작업 문화입니다. 메일 답장, 문서 정리,
                블로그 초안, 작은 버그, 사이드 프로젝트처럼 혼자 미루던 일을 조용히 끝내고, 가능하면 기록이나 PR까지
                남기는 흐름을 권합니다.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {ADMIN_NIGHT_TAGS.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-surface-200 bg-white/85 px-3 py-1.5 text-xs font-bold text-surface-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex flex-col gap-3 pt-3 sm:flex-row">
                <Link
                  href="https://github.com/kscold/kscold-blog-version-2"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cy="admin-night-hero-primary"
                  className="inline-flex items-center justify-center rounded-2xl bg-surface-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-surface-800"
                >
                  블로그 레포 보러 가기
                </Link>
                <Link
                  href="/feed"
                  data-cy="admin-night-hero-secondary"
                  className="inline-flex items-center justify-center rounded-2xl border border-surface-200 bg-white px-6 py-3 text-sm font-bold text-surface-900 transition-colors hover:bg-surface-50"
                >
                  지금 작업 흐름 피드에 남기기
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.95fr)]">
          <AdminNightCalendar slots={slots} />
          <LinkCard />
        </div>
      </div>
    </main>
  );
}
