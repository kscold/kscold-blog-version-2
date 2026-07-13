'use client';

import Link from 'next/link';
import type { AdminNightProgramVoteSummary } from '@/entities/admin-night/model/types';
import {
  AI_AGENT_BLOOM_DETAIL_PATH,
  AI_AGENT_BLOOM_PHASES,
  AI_AGENT_BLOOM_TOPIC_OPTIONS,
} from '@/widgets/admin-night/lib/adminNight';
import { optionLabel, topEntries } from './adminNightBloomForm';

interface BloomInfoColumnProps {
  summary: AdminNightProgramVoteSummary | undefined;
  readyCount: number;
}

export function BloomInfoColumn({ summary, readyCount }: BloomInfoColumnProps) {
  return (
    <div className="space-y-8 p-6 sm:p-8 lg:p-10">
      <div className="space-y-4">
        <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-white/70">
          AI Agent Bloom · Build & Share
        </div>
        <div className="max-w-3xl space-y-4 [word-break:keep-all]">
          <h2 className="text-[2.45rem] font-black leading-[1.08] tracking-tight sm:text-5xl sm:leading-[1.08]">
            <span className="inline-block">AI Agent,</span>{' '}
            <span className="inline-block">같이 만들고</span>
            <span className="hidden sm:inline">,</span>
            <br />
            <span className="inline-block">서로 피워볼 사람?</span>
          </h2>
          <div className="space-y-3 text-sm leading-8 text-white/68 sm:text-base">
            <p>
              작은 LLM 호출 하나에서 시작해 Prompt, Memory, LangGraph, RAG fallback까지 천천히 이어가보려 합니다.
            </p>
            <p>
              바이브코딩을 적극 활용해 실제 구현 흐름을 함께 따라가고, 만든 아이디어를 서로 나눠보는 자리로 준비하고 있습니다.
              지금은 먼저 같이 해보고 싶은 사람과 가능한 일정을 모으는 단계입니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={AI_AGENT_BLOOM_DETAIL_PATH}
              className="inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-black text-surface-950 transition-colors hover:bg-cyan-50"
            >
              공유용 강의 페이지 보기
            </Link>
            <a
              href="#ai-agent-bloom"
              className="inline-flex rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-white/15"
            >
              바로 투표하기
            </a>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {AI_AGENT_BLOOM_PHASES.map(phase => (
          <article
            key={phase.id}
            className={`rounded-[24px] border p-4 ${
              phase.state === 'active'
                ? 'border-cyan-300/60 bg-cyan-300/10'
                : 'border-white/10 bg-white/[0.04]'
            }`}
          >
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/45">{phase.label}</p>
            <h3 className="mt-2 text-lg font-black tracking-tight [word-break:keep-all]">{phase.title}</h3>
            <p className="mt-2 text-xs leading-6 text-white/58 [word-break:keep-all]">{phase.description}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4">
        <article className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-200">Current Signal</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <p className="text-4xl font-black">{summary?.totalVotes ?? 0}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-white/45">votes</p>
            </div>
            <div>
              <p className="text-4xl font-black">{readyCount}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-white/45">ready</p>
            </div>
          </div>
          <p className="mt-4 text-xs leading-6 text-white/55 [word-break:keep-all]">
            ready는 “일정 맞으면 참여”를 고른 사람입니다. 숫자가 쌓이면 실제 날짜와 장소,
            참가비 범위를 따로 안내하겠습니다.
          </p>
        </article>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/45">Hot Topics</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {topEntries(summary?.interestedTopicCounts, 5).length > 0 ? (
            topEntries(summary?.interestedTopicCounts, 5).map(([topic, count]) => (
              <span key={topic} className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold">
                {optionLabel(AI_AGENT_BLOOM_TOPIC_OPTIONS, topic)} · {count}
              </span>
            ))
          ) : (
            <span className="text-sm text-white/50">아직 투표 데이터가 없습니다. 첫 시그널을 남겨주세요.</span>
          )}
        </div>
      </div>
    </div>
  );
}
