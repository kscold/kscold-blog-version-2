import Link from 'next/link';
import {
  AI_AGENT_BLOOM_AGENDA,
  AI_AGENT_BLOOM_AUDIENCE,
  AI_AGENT_BLOOM_OUTCOMES,
  AI_AGENT_BLOOM_PHASES,
  AI_AGENT_BLOOM_TIMELINE,
} from '@/widgets/admin-night/lib/adminNight';
import { AdminNightBloomSection } from './AdminNightBloomSection';

export function AdminNightBloomDetailPage() {
  return (
    <main className="min-h-screen px-4 pb-20 pt-5 sm:px-6 sm:pt-10 lg:px-8 lg:pt-20">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="overflow-hidden rounded-[36px] border border-surface-200 bg-white shadow-soft">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-5 p-5 sm:space-y-6 sm:p-8 lg:p-10">
              <Link
                href="/admin-night"
                className="inline-flex items-center rounded-full border border-surface-200 bg-surface-50 px-4 py-2 text-xs font-bold text-surface-500 transition-colors hover:border-surface-300 hover:text-surface-900"
              >
                ← Admin Night로 돌아가기
              </Link>
              <div className="space-y-4">
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-cyan-600">
                  AI Agent Bloom
                </p>
                <h1 className="max-w-4xl text-[2.35rem] font-black leading-[1.08] tracking-tight text-surface-950 [word-break:keep-all] sm:text-6xl sm:leading-[1.05]">
                  <span className="inline-block">오프라인</span>{' '}
                  <span className="inline-block">AI Agent</span>{' '}
                  <span className="inline-block">어젠다 강의</span>
                </h1>
                <p className="max-w-3xl text-sm leading-8 text-surface-500 sm:text-base">
                  작은 LLM 호출에서 시작해 LCEL, Memory, LangGraph 기본 그래프, 조건부/병렬 실행, 로컬 우선
                  Multi-Agent System, RAG fallback, 평가와 관측까지 이어지는 오프라인 강의형 공유입니다. 강의는 바이브코딩을 적극 활용해 실제 구현 흐름을 함께 따라갑니다. 지금은 확정 신청이
                  아니라 수요조사 단계이며, 장소 대관·음식/음료·강의 준비를 포함해 참가비는 2만~3만 원 사이로 예상합니다.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <InfoPill label="진행 방식" value="오프라인 고정" />
                <InfoPill label="강의 방식" value="바이브코딩 적극 활용" />
                <InfoPill label="예상 참가비" value="2만~3만 원" />
                <InfoPill label="포함 항목" value="장소·음식·강의" />
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#ai-agent-bloom-vote"
                  className="inline-flex rounded-2xl bg-surface-900 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-surface-800"
                >
                  관심 투표하기
                </a>
                <a
                  href="#ai-agent-bloom-agenda"
                  className="inline-flex rounded-2xl border border-surface-200 bg-white px-5 py-3 text-sm font-black text-surface-900 transition-colors hover:bg-surface-50"
                >
                  어젠다 보기
                </a>
              </div>
            </div>

            <aside className="border-t border-surface-200 bg-surface-950 p-6 text-white sm:p-8 lg:border-l lg:border-t-0">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-white/45">Program State</p>
              <div className="mt-5 space-y-3">
                {AI_AGENT_BLOOM_PHASES.map(phase => (
                  <article
                    key={phase.id}
                    className={`rounded-[22px] border p-4 ${
                      phase.state === 'active'
                        ? 'border-cyan-300/60 bg-cyan-300/10'
                        : 'border-white/10 bg-white/[0.04]'
                    }`}
                  >
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/45">{phase.label}</p>
                    <h2 className="mt-2 text-base font-black">{phase.title}</h2>
                    <p className="mt-2 text-xs leading-6 text-white/58">{phase.description}</p>
                  </article>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <InfoList title="이런 분에게 맞아요" items={AI_AGENT_BLOOM_AUDIENCE} />
          <InfoList title="끝나면 가져갈 것" items={AI_AGENT_BLOOM_OUTCOMES} />
        </section>

        <section className="rounded-[36px] border border-surface-200 bg-white p-6 shadow-soft sm:p-8 lg:p-10">
          <div className="max-w-3xl space-y-3">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-surface-400">2 Hours Flow</p>
            <h2 className="text-3xl font-black tracking-tight text-surface-950">2시간 공유 실습 흐름</h2>
            <p className="text-sm leading-7 text-surface-500">
              오프라인 자리에서 처음부터 복잡한 멀티 에이전트로 들어가지 않고, 바이브코딩을 적극 활용해 LLM 호출에서 LangGraph MAS까지 단계적으로 확장합니다.
            </p>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {AI_AGENT_BLOOM_TIMELINE.map(item => (
              <article key={`${item.time}-${item.title}`} className="rounded-[24px] border border-surface-200 bg-surface-50 p-5">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-600">{item.time}</p>
                <h3 className="mt-2 text-lg font-black tracking-tight text-surface-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-surface-500">{item.goal}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="ai-agent-bloom-agenda" className="rounded-[36px] border border-surface-200 bg-white p-6 shadow-soft sm:p-8 lg:p-10">
          <div className="max-w-3xl space-y-3">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-surface-400">Agenda</p>
            <h2 className="text-3xl font-black tracking-tight text-surface-950">강의 어젠다</h2>
            <p className="text-sm leading-7 text-surface-500">
              방향은 “데모를 만드는 법”보다 “그래프 흐름을 검증하고 실제로 쓸 수 있는 Agent 시스템으로 확장하는 법”에 맞춰 둡니다.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {AI_AGENT_BLOOM_AGENDA.map(item => (
              <article key={item.id} className="rounded-[28px] border border-surface-200 bg-surface-50 p-5">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-600">{item.eyebrow}</p>
                <h3 className="mt-2 text-2xl font-black tracking-tight text-surface-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-surface-500">{item.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.bullets.map(bullet => (
                    <span key={bullet} className="rounded-full border border-surface-200 bg-white px-3 py-2 text-xs font-bold text-surface-500">
                      {bullet}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <div id="ai-agent-bloom-vote">
          <AdminNightBloomSection />
        </div>
      </div>
    </main>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-surface-400">{label}</p>
      <p className="mt-1 text-sm font-black text-surface-950">{value}</p>
    </div>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-[32px] border border-surface-200 bg-white p-6 shadow-soft sm:p-8">
      <h2 className="text-2xl font-black tracking-tight text-surface-950">{title}</h2>
      <ul className="mt-5 space-y-3">
        {items.map(item => (
          <li key={item} className="flex gap-3 text-sm leading-7 text-surface-500">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-cyan-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
