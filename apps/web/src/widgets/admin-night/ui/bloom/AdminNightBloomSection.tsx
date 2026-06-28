'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  useAdminNightProgramVoteSummary,
  useMyAdminNightProgramVote,
} from '@/entities/admin-night/api/useAdminNight';
import type {
  AdminNightProgramExperienceLevel,
  AdminNightProgramFoodPreference,
  AdminNightProgramInterestLevel,
  AdminNightProgramPreferredDay,
  AdminNightProgramPreferredFormat,
  AdminNightProgramSessionLength,
  AdminNightProgramSessionStyle,
} from '@/entities/admin-night/model/types';
import { useViewer } from '@/entities/user/model/useViewer';
import { useUpsertAdminNightProgramVote } from '@/features/admin-night/api/useAdminNightMutations';
import {
  AI_AGENT_BLOOM_EXPERIENCE_OPTIONS,
  AI_AGENT_BLOOM_DAY_OPTIONS,
  AI_AGENT_BLOOM_DETAIL_PATH,
  AI_AGENT_BLOOM_FOOD_OPTIONS,
  AI_AGENT_BLOOM_INTEREST_OPTIONS,
  AI_AGENT_BLOOM_PHASES,
  AI_AGENT_BLOOM_PROGRAM_KEY,
  AI_AGENT_BLOOM_SESSION_LENGTH_OPTIONS,
  AI_AGENT_BLOOM_SESSION_STYLE_OPTIONS,
  AI_AGENT_BLOOM_TIME_OPTIONS,
  AI_AGENT_BLOOM_TOPIC_OPTIONS,
  type AdminNightOption,
} from '@/widgets/admin-night/lib/adminNight';

interface BloomVoteFormState {
  requesterName: string;
  contactEmail: string;
  contact: string;
  interestLevel: AdminNightProgramInterestLevel;
  experienceLevel: AdminNightProgramExperienceLevel;
  sessionStyle: AdminNightProgramSessionStyle;
  sessionLength: AdminNightProgramSessionLength;
  foodPreference: AdminNightProgramFoodPreference;
  preferredDays: AdminNightProgramPreferredDay[];
  preferredTimes: string[];
  interestedTopics: string[];
  desiredTakeaways: string;
  message: string;
}

const initialFormState: BloomVoteFormState = {
  requesterName: '',
  contactEmail: '',
  contact: '',
  interestLevel: 'WANT_TO_ATTEND',
  experienceLevel: 'NEW_TO_AGENT',
  sessionStyle: 'MIXED',
  sessionLength: 'STANDARD_120',
  foodPreference: 'LIGHT_SNACK',
  preferredDays: ['SATURDAY', 'SUNDAY'],
  preferredTimes: ['weekend-day'],
  interestedTopics: ['agent-methodology', 'tool-rag-memory'],
  desiredTakeaways: '',
  message: '',
};

function optionLabel(options: AdminNightOption[], value: string) {
  return options.find(option => option.value === value)?.label ?? value;
}

function topEntries(counts?: Record<string, number>, limit = 3) {
  return Object.entries(counts ?? {})
    .sort(([, left], [, right]) => right - left)
    .slice(0, limit);
}

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter(item => item !== value) : [...values, value];
}

export function AdminNightBloomSection() {
  const { isAuthenticated, user } = useViewer();
  const [form, setForm] = useState<BloomVoteFormState>({
    ...initialFormState,
    requesterName: user?.displayName ?? '',
    contactEmail: user?.email ?? '',
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const { data: summary } = useAdminNightProgramVoteSummary(AI_AGENT_BLOOM_PROGRAM_KEY);
  const { data: myVote } = useMyAdminNightProgramVote(AI_AGENT_BLOOM_PROGRAM_KEY, isAuthenticated);
  const voteMutation = useUpsertAdminNightProgramVote(AI_AGENT_BLOOM_PROGRAM_KEY);

  useEffect(() => {
    if (myVote) {
      setForm({
        requesterName: myVote.requesterName,
        contactEmail: myVote.contactEmail ?? myVote.requesterEmail ?? user?.email ?? '',
        contact: myVote.contact ?? '',
        interestLevel: myVote.interestLevel,
        experienceLevel: myVote.experienceLevel,
        sessionStyle: myVote.sessionStyle ?? initialFormState.sessionStyle,
        sessionLength: myVote.sessionLength ?? initialFormState.sessionLength,
        foodPreference: myVote.foodPreference ?? initialFormState.foodPreference,
        preferredDays: myVote.preferredDays.length > 0 ? myVote.preferredDays : initialFormState.preferredDays,
        preferredTimes: myVote.preferredTimes.length > 0 ? myVote.preferredTimes : initialFormState.preferredTimes,
        interestedTopics:
          myVote.interestedTopics.length > 0 ? myVote.interestedTopics : initialFormState.interestedTopics,
        desiredTakeaways: myVote.desiredTakeaways ?? '',
        message: myVote.message ?? '',
      });
      return;
    }

    if (user?.displayName || user?.email) {
      setForm(prev => ({
        ...prev,
        requesterName: prev.requesterName || user?.displayName || '',
        contactEmail: prev.contactEmail || user?.email || '',
      }));
    }
  }, [myVote, user?.displayName, user?.email]);

  const readyCount = useMemo(
    () => summary?.interestLevelCounts.READY_IF_SCHEDULE_FITS ?? 0,
    [summary?.interestLevelCounts.READY_IF_SCHEDULE_FITS]
  );
  const canSubmit =
    form.requesterName.trim().length > 0 &&
    form.contactEmail.trim().length > 0 &&
    form.contact.trim().length > 0 &&
    form.desiredTakeaways.trim().length > 0 &&
    form.preferredDays.length > 0 &&
    form.preferredTimes.length > 0;

  const updateForm = <TKey extends keyof BloomVoteFormState>(key: TKey, value: BloomVoteFormState[TKey]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      setStatusMessage('본명, 이메일, 연락처, 희망 요일/시간, 얻어가고 싶은 내용을 먼저 남겨주세요.');
      return;
    }

    try {
      await voteMutation.mutateAsync({
        requesterName: form.requesterName,
        contactEmail: form.contactEmail,
        contact: form.contact,
        interestLevel: form.interestLevel,
        preferredFormat: 'OFFLINE' as AdminNightProgramPreferredFormat,
        experienceLevel: form.experienceLevel,
        sessionStyle: form.sessionStyle,
        sessionLength: form.sessionLength,
        foodPreference: form.foodPreference,
        preferredDays: form.preferredDays,
        preferredTimes: form.preferredTimes,
        interestedTopics: form.interestedTopics,
        desiredTakeaways: form.desiredTakeaways,
        message: form.message,
      });
      setStatusMessage('관심 투표를 저장했고, 입력한 이메일로 감사 메일을 보냈습니다. 실제 일정이 잡히면 같은 메일로 안내할게요.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : '투표를 저장하지 못했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <section id="ai-agent-bloom" className="overflow-hidden rounded-[36px] border border-surface-200 bg-surface-950 text-white shadow-soft">
      <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.85fr)]">
        <div className="space-y-8 p-6 sm:p-8 lg:p-10">
          <div className="space-y-4">
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-white/70">
              AI Agent Bloom · Offline Agenda
            </div>
            <div className="max-w-3xl space-y-4">
              <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
                오프라인 AI Agent 어젠다 강의,
                <br />
                먼저 듣고 싶은 사람을 모읍니다.
              </h2>
              <p className="text-sm leading-8 text-white/68 sm:text-base">
                LLM 호출에서 LCEL, Memory, LangGraph MAS, RAG fallback, 평가와 관측까지 이어지는 오프라인 강의형 공유입니다.
                강의는 바이브코딩을 적극 활용해 실제 구현 흐름을 함께 따라가며, 장소 대관, 음식/음료, 강의 준비를 포함해 참가비는 2만~3만 원 사이로 예상합니다.
              </p>
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
                <h3 className="mt-2 text-lg font-black tracking-tight">{phase.title}</h3>
                <p className="mt-2 text-xs leading-6 text-white/58">{phase.description}</p>
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
              <p className="mt-4 text-xs leading-6 text-white/55">
                ready는 “일정 맞으면 참여”를 고른 사람입니다. 이번 Bloom은 오프라인 고정이며,
                바이브코딩을 적극 활용하는 강의형 세션으로 진행합니다. 실제 일정 확정 시 예상 참가비 2만~3만 원 범위로 안내합니다.
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

        <div className="border-t border-white/10 bg-white p-6 text-surface-900 sm:p-8 xl:border-l xl:border-t-0">
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-surface-400">Interest Form</p>
            <h3 className="text-2xl font-black tracking-tight">AI Agent Bloom 투표</h3>
            <p className="text-sm leading-7 text-surface-500">
              오프라인 고정으로 진행할 예정입니다. 바이브코딩을 적극 활용하며, 장소 대관, 음식/음료, 강의 준비를 포함해 예상 참가비는 2만~3만 원 사이입니다.
            </p>
          </div>

          {isAuthenticated ? (
            <div className="mt-6 space-y-5">
              <div className="space-y-2">
                <label htmlFor="ai-agent-bloom-name" className="text-sm font-bold text-surface-900">
                  실제 본명
                </label>
                <input
                  id="ai-agent-bloom-name"
                  value={form.requesterName}
                  onChange={event => updateForm('requesterName', event.target.value)}
                  placeholder="실제 진행 안내에 사용할 본명"
                  className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-surface-300 focus:border-surface-900"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="ai-agent-bloom-email" className="text-sm font-bold text-surface-900">
                    안내 받을 이메일
                  </label>
                  <input
                    id="ai-agent-bloom-email"
                    type="email"
                    value={form.contactEmail}
                    onChange={event => updateForm('contactEmail', event.target.value)}
                    placeholder="schedule@example.com"
                    className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-surface-300 focus:border-surface-900"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="ai-agent-bloom-contact" className="text-sm font-bold text-surface-900">
                    연락처
                  </label>
                  <input
                    id="ai-agent-bloom-contact"
                    value={form.contact}
                    onChange={event => updateForm('contact', event.target.value)}
                    placeholder="전화, 카톡, 슬랙 등 편한 연락처"
                    className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-surface-300 focus:border-surface-900"
                  />
                </div>
              </div>

              <OptionButtonGroup
                title="참여 의향"
                options={AI_AGENT_BLOOM_INTEREST_OPTIONS}
                value={form.interestLevel}
                onChange={value => updateForm('interestLevel', value as AdminNightProgramInterestLevel)}
              />

              <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm leading-7 text-cyan-900">
                <p className="font-black">진행 방식: 오프라인 고정</p>
                <p className="mt-1 text-cyan-800">
                  이번 Bloom은 실제 장소에서 바이브코딩을 적극 활용한 어젠다 강의와 가벼운 네트워킹으로 잡습니다.
                </p>
              </div>

              <OptionButtonGroup
                title="현재 경험 수준"
                options={AI_AGENT_BLOOM_EXPERIENCE_OPTIONS}
                value={form.experienceLevel}
                onChange={value => updateForm('experienceLevel', value as AdminNightProgramExperienceLevel)}
              />

              <OptionButtonGroup
                title="선호 Bloom 형식"
                options={AI_AGENT_BLOOM_SESSION_STYLE_OPTIONS}
                value={form.sessionStyle}
                onChange={value => updateForm('sessionStyle', value as AdminNightProgramSessionStyle)}
              />

              <OptionButtonGroup
                title="좋은 Bloom 시간"
                options={AI_AGENT_BLOOM_SESSION_LENGTH_OPTIONS}
                value={form.sessionLength}
                onChange={value => updateForm('sessionLength', value as AdminNightProgramSessionLength)}
              />

              <OptionButtonGroup
                title="음식/음료 선호"
                options={AI_AGENT_BLOOM_FOOD_OPTIONS}
                value={form.foodPreference}
                onChange={value => updateForm('foodPreference', value as AdminNightProgramFoodPreference)}
              />

              <MultiSelectGrid
                title="희망 요일"
                options={AI_AGENT_BLOOM_DAY_OPTIONS}
                values={form.preferredDays}
                onToggle={value =>
                  updateForm('preferredDays', toggleValue(form.preferredDays, value) as AdminNightProgramPreferredDay[])
                }
              />

              <MultiSelectGrid
                title="가능한 시간대"
                options={AI_AGENT_BLOOM_TIME_OPTIONS}
                values={form.preferredTimes}
                onToggle={value => updateForm('preferredTimes', toggleValue(form.preferredTimes, value))}
              />

              <MultiSelectGrid
                title="듣고 싶은 주제"
                options={AI_AGENT_BLOOM_TOPIC_OPTIONS}
                values={form.interestedTopics}
                onToggle={value => updateForm('interestedTopics', toggleValue(form.interestedTopics, value))}
              />

              <div className="space-y-2">
                <label htmlFor="ai-agent-bloom-takeaways" className="text-sm font-bold text-surface-900">
                  얻어가고 싶은 것
                </label>
                <textarea
                  id="ai-agent-bloom-takeaways"
                  value={form.desiredTakeaways}
                  onChange={event => updateForm('desiredTakeaways', event.target.value)}
                  placeholder="예: LangGraph 설계 감각, RAG fallback 구조, 실제 업무에 붙이는 기준 같은 것을 적어주세요."
                  className="min-h-28 w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm leading-7 outline-none transition-colors placeholder:text-surface-300 focus:border-surface-900"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="ai-agent-bloom-message" className="text-sm font-bold text-surface-900">
                  추가로 남길 말
                </label>
                <textarea
                  id="ai-agent-bloom-message"
                  value={form.message}
                  onChange={event => updateForm('message', event.target.value)}
                  placeholder="목차에 꼭 들어가면 좋을 내용, 현재 막힌 지점, 같이 나누고 싶은 맥락을 적어주세요."
                  className="min-h-28 w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm leading-7 outline-none transition-colors placeholder:text-surface-300 focus:border-surface-900"
                />
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit || voteMutation.isPending}
                className="w-full rounded-2xl bg-surface-900 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-surface-800 disabled:cursor-not-allowed disabled:bg-surface-300"
              >
                {voteMutation.isPending ? '투표 저장 중…' : myVote ? '투표 다시 저장하기' : '관심 투표 남기기'}
              </button>

              {statusMessage && (
                <p className="rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm leading-6 text-surface-600">
                  {statusMessage}
                </p>
              )}
            </div>
          ) : (
            <div className="mt-6 rounded-[24px] border border-surface-200 bg-surface-50 p-5">
              <h4 className="text-lg font-black tracking-tight">로그인 후 투표할 수 있어요.</h4>
              <p className="mt-2 text-sm leading-7 text-surface-500">
                중복 투표를 막고, 이후 일정 안내를 이어가기 위해 로그인한 사용자만 투표를 남길 수 있습니다.
              </p>
              <Link
                href="/login?redirect=/admin-night/ai-agent-bloom%23ai-agent-bloom"
                className="mt-4 inline-flex rounded-2xl bg-surface-900 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-surface-800"
              >
                로그인하고 투표하기
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function OptionButtonGroup({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: AdminNightOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-bold text-surface-900">{title}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map(option => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
              value === option.value
                ? 'border-surface-900 bg-surface-900 text-white'
                : 'border-surface-200 bg-surface-50 text-surface-900 hover:border-surface-300'
            }`}
          >
            <p className="text-sm font-black">{option.label}</p>
            <p className="mt-1 text-xs leading-5 opacity-75">{option.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function MultiSelectGrid({
  title,
  options,
  values,
  onToggle,
}: {
  title: string;
  options: AdminNightOption[];
  values: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-bold text-surface-900">{title}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map(option => {
          const selected = values.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onToggle(option.value)}
              className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                selected
                  ? 'border-cyan-500 bg-cyan-50 text-surface-900'
                  : 'border-surface-200 bg-surface-50 text-surface-900 hover:border-surface-300'
              }`}
            >
              <p className="text-sm font-black">{option.label}</p>
              <p className="mt-1 text-xs leading-5 text-surface-500">{option.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
