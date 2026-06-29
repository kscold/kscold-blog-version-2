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

type BloomVoteFormErrors = Partial<Record<keyof BloomVoteFormState, string>>;

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

const NAME_PATTERN = /^[가-힣A-Za-z][가-힣A-Za-z\s·.-]{1,39}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function onlyPhoneDigits(value: string) {
  return value.replace(/\D/g, '');
}

function formatPhoneNumber(value: string) {
  const rawDigits = onlyPhoneDigits(value);
  const digits = rawDigits.startsWith('02') ? rawDigits.slice(0, 10) : rawDigits.slice(0, 11);

  if (digits.startsWith('02')) {
    if (digits.length <= 2) {
      return digits;
    }
    if (digits.length <= 5) {
      return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    }
    if (digits.length <= 9) {
      return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
    }
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  if (digits.length <= 3) {
    return digits;
  }
  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function isValidPhoneNumber(value: string) {
  const digits = onlyPhoneDigits(value);
  return /^(01[016789]\d{7,8}|02\d{7,8}|0[3-9]\d{8,9})$/.test(digits);
}

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

function validateBloomVoteForm(form: BloomVoteFormState) {
  const errors: BloomVoteFormErrors = {};
  const requesterName = form.requesterName.trim();
  const contactEmail = form.contactEmail.trim();

  if (!requesterName) {
    errors.requesterName = '실제 본명을 적어주세요.';
  } else if (!NAME_PATTERN.test(requesterName)) {
    errors.requesterName = '본명은 한글/영문 기준 2~40자로 적어주세요.';
  }

  if (!contactEmail) {
    errors.contactEmail = '안내 받을 이메일을 적어주세요.';
  } else if (contactEmail.length > 120 || !EMAIL_PATTERN.test(contactEmail)) {
    errors.contactEmail = '이메일 형식이 올바르지 않습니다.';
  }

  if (!form.contact.trim()) {
    errors.contact = '연락처를 적어주세요.';
  } else if (!isValidPhoneNumber(form.contact)) {
    errors.contact = '연락처는 010-1234-5678처럼 숫자 10~11자리로 적어주세요.';
  }

  if (!form.interestLevel) {
    errors.interestLevel = '참여 의향을 골라주세요.';
  }
  if (!form.experienceLevel) {
    errors.experienceLevel = '현재 경험 수준을 골라주세요.';
  }
  if (!form.sessionStyle) {
    errors.sessionStyle = '선호 Bloom 형식을 골라주세요.';
  }
  if (!form.sessionLength) {
    errors.sessionLength = '좋은 Bloom 시간을 골라주세요.';
  }
  if (!form.foodPreference) {
    errors.foodPreference = '음식/음료 선호를 골라주세요.';
  }
  if (form.preferredDays.length === 0) {
    errors.preferredDays = '희망 요일을 하나 이상 골라주세요.';
  }
  if (form.preferredTimes.length === 0) {
    errors.preferredTimes = '가능한 시간대를 하나 이상 골라주세요.';
  }
  if (form.interestedTopics.length === 0) {
    errors.interestedTopics = '듣고 싶은 주제를 하나 이상 골라주세요.';
  }

  return errors;
}

function firstFormError(errors: BloomVoteFormErrors) {
  const order: (keyof BloomVoteFormState)[] = [
    'requesterName',
    'contactEmail',
    'contact',
    'interestLevel',
    'experienceLevel',
    'sessionStyle',
    'sessionLength',
    'foodPreference',
    'preferredDays',
    'preferredTimes',
    'interestedTopics',
  ];
  const firstKey = order.find(key => errors[key]);
  return firstKey ? errors[firstKey] ?? null : null;
}

export function AdminNightBloomSection() {
  const { isAuthenticated, user } = useViewer();
  const [form, setForm] = useState<BloomVoteFormState>({
    ...initialFormState,
    requesterName: user?.displayName ?? '',
    contactEmail: user?.email ?? '',
  });
  const [formErrors, setFormErrors] = useState<BloomVoteFormErrors>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const { data: summary } = useAdminNightProgramVoteSummary(AI_AGENT_BLOOM_PROGRAM_KEY);
  const { data: myVote } = useMyAdminNightProgramVote(AI_AGENT_BLOOM_PROGRAM_KEY, isAuthenticated);
  const voteMutation = useUpsertAdminNightProgramVote(AI_AGENT_BLOOM_PROGRAM_KEY);

  useEffect(() => {
    if (myVote) {
      setForm({
        requesterName: myVote.requesterName,
        contactEmail: myVote.contactEmail ?? myVote.requesterEmail ?? user?.email ?? '',
        contact: formatPhoneNumber(myVote.contact ?? ''),
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

  const updateForm = <TKey extends keyof BloomVoteFormState>(key: TKey, value: BloomVoteFormState[TKey]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setFormErrors(prev => {
      if (!prev[key]) {
        return prev;
      }
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setStatusMessage(null);
  };

  const handleSubmit = async () => {
    const nextErrors = validateBloomVoteForm(form);
    const firstError = firstFormError(nextErrors);
    setFormErrors(nextErrors);

    if (firstError) {
      setStatusMessage(firstError);
      return;
    }

    try {
      await voteMutation.mutateAsync({
        requesterName: form.requesterName.trim(),
        contactEmail: form.contactEmail.trim(),
        contact: formatPhoneNumber(form.contact),
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

        <div className="border-t border-white/10 bg-white p-6 text-surface-900 sm:p-8 xl:border-l xl:border-t-0">
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-surface-400">Interest Form</p>
            <h3 className="text-2xl font-black tracking-tight">AI Agent Bloom 투표</h3>
            <p className="text-sm leading-7 text-surface-500">
              오프라인으로 진행할 예정입니다. 아직 신청 확정은 아니고, 먼저 관심도와 가능한 시간을 모으는 단계입니다.
            </p>
          </div>

          <div className="mt-6 space-y-5">
            <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm leading-7 text-cyan-900">
              <p className="font-black">진행 방식: 오프라인 고정</p>
              <p className="mt-1 text-cyan-800">
                세부 구성은 투표 결과를 보고 정합니다. 듣기 좋은 방식과 가능한 시간을 편하게 남겨주세요.
              </p>
            </div>

            {!isAuthenticated && (
              <div className="rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm leading-7 text-surface-600">
                <p className="font-black text-surface-900">로그인 없이도 투표할 수 있어요.</p>
                <p className="mt-1">
                  나중에 일정 안내를 보낼 수 있도록 본명, 이메일, 연락처만 정확히 남겨주세요.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="ai-agent-bloom-name" className="text-sm font-bold text-surface-900">
                실제 본명 <span className="text-cyan-600">*</span>
              </label>
              <input
                id="ai-agent-bloom-name"
                value={form.requesterName}
                onChange={event => updateForm('requesterName', event.target.value)}
                placeholder="실제 진행 안내에 사용할 본명"
                aria-invalid={Boolean(formErrors.requesterName)}
                className={`w-full rounded-2xl border bg-surface-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-surface-300 focus:border-surface-900 ${
                  formErrors.requesterName ? 'border-rose-300' : 'border-surface-200'
                }`}
              />
              {formErrors.requesterName && (
                <p className="text-xs font-bold text-rose-500">{formErrors.requesterName}</p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="ai-agent-bloom-email" className="text-sm font-bold text-surface-900">
                  안내 받을 이메일 <span className="text-cyan-600">*</span>
                </label>
                <input
                  id="ai-agent-bloom-email"
                  type="email"
                  value={form.contactEmail}
                  onChange={event => updateForm('contactEmail', event.target.value)}
                  placeholder="schedule@example.com"
                  autoComplete="email"
                  aria-invalid={Boolean(formErrors.contactEmail)}
                  className={`w-full rounded-2xl border bg-surface-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-surface-300 focus:border-surface-900 ${
                    formErrors.contactEmail ? 'border-rose-300' : 'border-surface-200'
                  }`}
                />
                {formErrors.contactEmail && (
                  <p className="text-xs font-bold text-rose-500">{formErrors.contactEmail}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="ai-agent-bloom-contact" className="text-sm font-bold text-surface-900">
                  연락처 <span className="text-cyan-600">*</span>
                </label>
                <input
                  id="ai-agent-bloom-contact"
                  value={form.contact}
                  onChange={event => updateForm('contact', formatPhoneNumber(event.target.value))}
                  placeholder="010-1234-5678"
                  inputMode="numeric"
                  autoComplete="tel"
                  aria-invalid={Boolean(formErrors.contact)}
                  className={`w-full rounded-2xl border bg-surface-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-surface-300 focus:border-surface-900 ${
                    formErrors.contact ? 'border-rose-300' : 'border-surface-200'
                  }`}
                />
                {formErrors.contact && (
                  <p className="text-xs font-bold text-rose-500">{formErrors.contact}</p>
                )}
              </div>
            </div>

              <OptionButtonGroup
                title="참여 의향"
                options={AI_AGENT_BLOOM_INTEREST_OPTIONS}
                value={form.interestLevel}
                onChange={value => updateForm('interestLevel', value as AdminNightProgramInterestLevel)}
                error={formErrors.interestLevel}
                required
              />

              <OptionButtonGroup
                title="현재 경험 수준"
                options={AI_AGENT_BLOOM_EXPERIENCE_OPTIONS}
                value={form.experienceLevel}
                onChange={value => updateForm('experienceLevel', value as AdminNightProgramExperienceLevel)}
                error={formErrors.experienceLevel}
                required
              />

              <OptionButtonGroup
                title="선호 Bloom 형식"
                options={AI_AGENT_BLOOM_SESSION_STYLE_OPTIONS}
                value={form.sessionStyle}
                onChange={value => updateForm('sessionStyle', value as AdminNightProgramSessionStyle)}
                error={formErrors.sessionStyle}
                required
              />

              <OptionButtonGroup
                title="좋은 Bloom 시간"
                options={AI_AGENT_BLOOM_SESSION_LENGTH_OPTIONS}
                value={form.sessionLength}
                onChange={value => updateForm('sessionLength', value as AdminNightProgramSessionLength)}
                error={formErrors.sessionLength}
                required
              />

              <OptionButtonGroup
                title="음식/음료 선호"
                options={AI_AGENT_BLOOM_FOOD_OPTIONS}
                value={form.foodPreference}
                onChange={value => updateForm('foodPreference', value as AdminNightProgramFoodPreference)}
                error={formErrors.foodPreference}
                required
              />

              <MultiSelectGrid
                title="희망 요일"
                options={AI_AGENT_BLOOM_DAY_OPTIONS}
                values={form.preferredDays}
                onToggle={value =>
                  updateForm('preferredDays', toggleValue(form.preferredDays, value) as AdminNightProgramPreferredDay[])
                }
                error={formErrors.preferredDays}
                required
              />

              <MultiSelectGrid
                title="가능한 시간대"
                options={AI_AGENT_BLOOM_TIME_OPTIONS}
                values={form.preferredTimes}
                onToggle={value => updateForm('preferredTimes', toggleValue(form.preferredTimes, value))}
                error={formErrors.preferredTimes}
                required
              />

              <MultiSelectGrid
                title="듣고 싶은 주제"
                options={AI_AGENT_BLOOM_TOPIC_OPTIONS}
                values={form.interestedTopics}
                onToggle={value => updateForm('interestedTopics', toggleValue(form.interestedTopics, value))}
                error={formErrors.interestedTopics}
                required
              />

              <div className="space-y-2">
                <label htmlFor="ai-agent-bloom-takeaways" className="text-sm font-bold text-surface-900">
                  얻어가고 싶은 것 <span className="text-surface-400">(선택)</span>
                </label>
                <textarea
                  id="ai-agent-bloom-takeaways"
                  value={form.desiredTakeaways}
                  onChange={event => updateForm('desiredTakeaways', event.target.value)}
                  placeholder="예: LangGraph 흐름을 감으로 잡고 싶어요. 실제 업무에 붙일 때 기준이 궁금해요."
                  className="min-h-28 w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm leading-7 outline-none transition-colors placeholder:text-surface-300 focus:border-surface-900"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="ai-agent-bloom-message" className="text-sm font-bold text-surface-900">
                  추가로 남길 말 <span className="text-surface-400">(선택)</span>
                </label>
                <textarea
                  id="ai-agent-bloom-message"
                  value={form.message}
                  onChange={event => updateForm('message', event.target.value)}
                  placeholder="목차에 들어가면 좋을 내용이나 지금 궁금한 점이 있다면 편하게 남겨주세요."
                  className="min-h-28 w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm leading-7 outline-none transition-colors placeholder:text-surface-300 focus:border-surface-900"
                />
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={voteMutation.isPending}
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
  error,
  required = false,
}: {
  title: string;
  options: AdminNightOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-bold text-surface-900">
        {title} {required && <span className="text-cyan-600">*</span>}
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map(option => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
              value === option.value
                ? 'border-surface-900 bg-surface-900 text-white'
                : error
                  ? 'border-rose-200 bg-rose-50 text-surface-900 hover:border-rose-300'
                  : 'border-surface-200 bg-surface-50 text-surface-900 hover:border-surface-300'
            }`}
          >
            <p className="text-sm font-black">{option.label}</p>
            <p className="mt-1 text-xs leading-5 opacity-75">{option.description}</p>
          </button>
        ))}
      </div>
      {error && <p className="text-xs font-bold text-rose-500">{error}</p>}
    </div>
  );
}

function MultiSelectGrid({
  title,
  options,
  values,
  onToggle,
  error,
  required = false,
}: {
  title: string;
  options: AdminNightOption[];
  values: string[];
  onToggle: (value: string) => void;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-bold text-surface-900">
        {title} {required && <span className="text-cyan-600">*</span>}
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map(option => {
          const selected = values.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onToggle(option.value)}
              aria-pressed={selected}
              className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                selected
                  ? 'border-cyan-500 bg-cyan-50 text-surface-900'
                  : error
                    ? 'border-rose-200 bg-rose-50 text-surface-900 hover:border-rose-300'
                    : 'border-surface-200 bg-surface-50 text-surface-900 hover:border-surface-300'
              }`}
            >
              <p className="text-sm font-black">{option.label}</p>
              <p className="mt-1 text-xs leading-5 text-surface-500">{option.description}</p>
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs font-bold text-rose-500">{error}</p>}
    </div>
  );
}
