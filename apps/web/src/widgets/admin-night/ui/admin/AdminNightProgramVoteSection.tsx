'use client';

import {
  useAdminNightProgramVoteSummary,
  useAdminNightProgramVotes,
} from '@/entities/admin-night';
import {
  AI_AGENT_BLOOM_DAY_OPTIONS,
  AI_AGENT_BLOOM_EXPERIENCE_OPTIONS,
  AI_AGENT_BLOOM_FOOD_OPTIONS,
  AI_AGENT_BLOOM_INTEREST_OPTIONS,
  AI_AGENT_BLOOM_PROGRAM_KEY,
  AI_AGENT_BLOOM_SESSION_LENGTH_OPTIONS,
  AI_AGENT_BLOOM_SESSION_STYLE_OPTIONS,
  AI_AGENT_BLOOM_TIME_OPTIONS,
  AI_AGENT_BLOOM_TOPIC_OPTIONS,
  type AdminNightOption,
} from '@/widgets/admin-night/lib/adminNight';
import { AdminNightStatusSection } from './AdminNightStatusSection';

function labelOf(options: AdminNightOption[], value: string) {
  return options.find(option => option.value === value)?.label ?? value;
}

function topLabel(options: AdminNightOption[], counts?: Record<string, number>) {
  const [entry] = Object.entries(counts ?? {}).sort(([, left], [, right]) => right - left);
  if (!entry) {
    return '아직 없음';
  }
  return `${labelOf(options, entry[0])} · ${entry[1]}`;
}

function formatDate(value?: string | null) {
  if (!value) {
    return '';
  }
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function AdminNightProgramVoteSection() {
  const { data: summary } = useAdminNightProgramVoteSummary(AI_AGENT_BLOOM_PROGRAM_KEY);
  const { data: votes = [], isLoading } = useAdminNightProgramVotes(AI_AGENT_BLOOM_PROGRAM_KEY);
  const readyCount = summary?.interestLevelCounts.READY_IF_SCHEDULE_FITS ?? 0;

  return (
    <AdminNightStatusSection
      title="AI Agent Bloom 수요조사"
      description="목차 공개 전 관심 투표입니다. 충분히 모이면 실제 일정, 인원, 준비물 공지 단계로 넘깁니다."
      countLabel={`${summary?.totalVotes ?? 0} votes`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <SummaryCard label="전체 투표" value={`${summary?.totalVotes ?? 0}`} />
        <SummaryCard label="일정 맞으면 참여" value={`${readyCount}`} />
        <SummaryCard label="진행 형태" value="오프라인 고정" />
        <SummaryCard label="희망 요일" value={topLabel(AI_AGENT_BLOOM_DAY_OPTIONS, summary?.preferredDayCounts)} />
        <SummaryCard label="진행 방식" value={topLabel(AI_AGENT_BLOOM_SESSION_STYLE_OPTIONS, summary?.sessionStyleCounts)} />
        <SummaryCard label="Bloom 시간" value={topLabel(AI_AGENT_BLOOM_SESSION_LENGTH_OPTIONS, summary?.sessionLengthCounts)} />
        <SummaryCard label="음식/음료" value={topLabel(AI_AGENT_BLOOM_FOOD_OPTIONS, summary?.foodPreferenceCounts)} />
        <SummaryCard label="선호 시간" value={topLabel(AI_AGENT_BLOOM_TIME_OPTIONS, summary?.preferredTimeCounts)} />
      </div>

      <div className="mt-4 rounded-[24px] border border-surface-200 bg-surface-50 p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-surface-400">Top Topics</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(summary?.interestedTopicCounts ?? {})
            .sort(([, left], [, right]) => right - left)
            .slice(0, 6)
            .map(([topic, count]) => (
              <span key={topic} className="rounded-full border border-surface-200 bg-white px-3 py-2 text-xs font-bold text-surface-600">
                {labelOf(AI_AGENT_BLOOM_TOPIC_OPTIONS, topic)} · {count}
              </span>
            ))}
          {Object.keys(summary?.interestedTopicCounts ?? {}).length === 0 && (
            <span className="text-sm text-surface-500">아직 관심 주제 데이터가 없습니다.</span>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <div className="rounded-[24px] border border-surface-200 bg-surface-50 px-5 py-6 text-sm text-surface-500">
            Bloom 투표를 불러오는 중입니다.
          </div>
        ) : votes.length === 0 ? (
          <div className="rounded-[24px] border border-surface-200 bg-surface-50 px-5 py-6 text-sm text-surface-500">
            아직 Bloom 관심 투표가 없습니다.
          </div>
        ) : (
          votes.slice(0, 12).map(vote => (
            <article key={vote.id} className="rounded-[24px] border border-surface-200 bg-white p-5">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-surface-400">
                    {labelOf(AI_AGENT_BLOOM_INTEREST_OPTIONS, vote.interestLevel)}
                  </p>
                  <h3 className="mt-2 text-lg font-black tracking-tight text-surface-900">
                    {vote.requesterName} · {labelOf(AI_AGENT_BLOOM_EXPERIENCE_OPTIONS, vote.experienceLevel)}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-surface-500">
                    {vote.contactEmail ?? vote.requesterEmail} · {vote.contact ?? '연락처 없음'} · 오프라인 고정
                  </p>
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-surface-400">
                  {formatDate(vote.updatedAt ?? vote.createdAt)}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {(vote.preferredDays ?? []).map(day => (
                  <span key={day} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    {labelOf(AI_AGENT_BLOOM_DAY_OPTIONS, day)}
                  </span>
                ))}
                {vote.sessionStyle && (
                  <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
                    {labelOf(AI_AGENT_BLOOM_SESSION_STYLE_OPTIONS, vote.sessionStyle)}
                  </span>
                )}
                {vote.sessionLength && (
                  <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
                    {labelOf(AI_AGENT_BLOOM_SESSION_LENGTH_OPTIONS, vote.sessionLength)}
                  </span>
                )}
                {vote.foodPreference && (
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                    {labelOf(AI_AGENT_BLOOM_FOOD_OPTIONS, vote.foodPreference)}
                  </span>
                )}
                {vote.preferredTimes.map(time => (
                  <span key={time} className="rounded-full bg-surface-100 px-3 py-1 text-xs font-bold text-surface-500">
                    {labelOf(AI_AGENT_BLOOM_TIME_OPTIONS, time)}
                  </span>
                ))}
                {vote.interestedTopics.map(topic => (
                  <span key={topic} className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700">
                    {labelOf(AI_AGENT_BLOOM_TOPIC_OPTIONS, topic)}
                  </span>
                ))}
              </div>
              {vote.desiredTakeaways && (
                <p className="mt-4 rounded-2xl bg-surface-50 px-4 py-3 text-sm leading-7 text-surface-600">
                  <strong className="font-black text-surface-900">얻어가고 싶은 것</strong>
                  <br />
                  {vote.desiredTakeaways}
                </p>
              )}
              {vote.message && <p className="mt-4 text-sm leading-7 text-surface-600">{vote.message}</p>}
            </article>
          ))
        )}
      </div>
    </AdminNightStatusSection>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-[24px] border border-surface-200 bg-surface-50 p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-surface-400">{label}</p>
      <p className="mt-2 text-2xl font-black tracking-tight text-surface-900">{value}</p>
    </article>
  );
}
