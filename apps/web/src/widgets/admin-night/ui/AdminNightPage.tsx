import Link from 'next/link';
import { PROFILE } from '@/entities/profile/model/profileData';
import {
  ADMIN_NIGHT_LINKS,
  ADMIN_NIGHT_STEPS,
  ADMIN_NIGHT_TAGS,
  buildAdminNightSlots,
} from '@/widgets/admin-night/lib/adminNight';
import { AdminNightCalendar } from './AdminNightCalendar';

function CultureNoteCard() {
  return (
    <section className="rounded-[28px] border border-surface-200 bg-white p-6">
      <div className="space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-surface-400">
          Culture Note
        </p>
        <h2 className="text-2xl font-black tracking-tight text-surface-900">
          술 대신, 각자 끝낼 일을 들고 모이는 밤
        </h2>
      </div>
      <div className="mt-4 space-y-3 text-sm leading-7 text-surface-500 sm:text-[15px]">
        <p>
          Admin Night는 {PROFILE.name}과 같이 퇴근 후나 주말에 붙어서, 메일 답장, 블로그 초안, 작은 버그,
          문서 정리처럼 미뤄둔 일을 조용히 끝내는 문화 페이지입니다.
        </p>
        <p>
          오래 이야기하지 않아도 괜찮고, 같은 시간대에 각자 할 일을 한다는 감각만으로도 시작이 쉬워집니다. 여기서
          말하는 PR은 코드 PR이라기보다 참가 의사를 보내는 비유에 가깝고, 제가 승인하면 merge 혹은 meet해서 실제
          카공으로 이어지는 흐름을 상상하고 있습니다.
        </p>
      </div>
    </section>
  );
}

function JoinFlowCard() {
  return (
    <section className="rounded-[28px] border border-surface-200 bg-white p-6">
      <div className="mb-4 space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-surface-400">
          Join Flow
        </p>
        <h2 className="text-2xl font-black tracking-tight text-surface-900">
          같이 붙는 방법
        </h2>
      </div>

      <div className="space-y-3">
        {ADMIN_NIGHT_STEPS.map((step, index) => (
          <article key={step.id} className="rounded-2xl border border-surface-200 bg-surface-50 px-4 py-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-900 text-xs font-black text-white">
                {index + 1}
              </span>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold leading-5 text-surface-900">{step.title}</h3>
                <p className="text-xs leading-5 text-surface-500 sm:text-[13px]">{step.description}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ParticipateCard() {
  return (
    <section className="rounded-[28px] border border-surface-200 bg-surface-900 p-6 text-white">
      <div className="space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-surface-400">
          Participate
        </p>
        <h2 className="text-2xl font-black tracking-tight">
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
  );
}

export function AdminNightPage() {
  const slots = buildAdminNightSlots(new Date());

  return (
    <main className="min-h-screen px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-8">
        <section className="overflow-hidden rounded-[32px] border border-surface-200 bg-white shadow-sm">
          <div className="border-b border-surface-200 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.08),_transparent_46%),linear-gradient(180deg,_rgba(248,250,252,0.96),_rgba(255,255,255,1))] px-6 py-8 sm:px-8 sm:py-10">
            <div className="max-w-4xl space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-surface-400">
                Admin Night
              </p>
              <h1 className="text-4xl font-black tracking-tight text-surface-900 sm:text-5xl">
                퇴근 후 같이 붙어,
                <br />
                각자 할 일을 끝내는 밤
              </h1>
              <div className="max-w-3xl space-y-3 text-base leading-8 text-surface-500 sm:text-lg">
                <p>
                  Admin Night는 {PROFILE.name}과 같이 퇴근 후나 주말에 붙어서, 메일 답장, 블로그 초안, 작은 버그,
                  문서 정리처럼 미뤄둔 일을 조용히 끝내는 문화 페이지입니다.
                </p>
                <p>
                  오래 이야기하지 않아도 괜찮고, 같은 시간대에 각자 할 일을 한다는 감각만으로도 시작이 쉬워집니다.
                  내가 말하는 PR은 코드 PR이라기보다 참가 신청의 비유이고, 제가 승인하면 merge 혹은 meet해서 실제
                  카공으로 이어지는 흐름입니다.
                </p>
              </div>
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
                  href="/admin-night?chat=open"
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
          </div>
        </section>

        <AdminNightCalendar slots={slots} />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <CultureNoteCard />
          <div className="space-y-4">
            <JoinFlowCard />
            <ParticipateCard />
          </div>
        </div>
      </div>
    </main>
  );
}
