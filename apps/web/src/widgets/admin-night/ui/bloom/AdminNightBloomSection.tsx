'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  useAdminNightProgramVoteSummary,
  useMyAdminNightProgramVote,
} from '@/entities/admin-night';
import type { AdminNightProgramPreferredFormat } from '@/entities/admin-night';
import { useViewer } from '@/entities/user';
import { useUpsertAdminNightProgramVote } from '@/features/admin-night';
import { AI_AGENT_BLOOM_PROGRAM_KEY } from '@/widgets/admin-night/lib/adminNight';
import {
  firstFormError,
  formatPhoneNumber,
  initialFormState,
  validateBloomVoteForm,
  type BloomVoteFormErrors,
  type BloomVoteFormState,
} from './adminNightBloomForm';
import { BloomInfoColumn } from './BloomInfoColumn';
import { BloomVoteForm } from './BloomVoteForm';

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
        <BloomInfoColumn summary={summary} readyCount={readyCount} />

        <BloomVoteForm
          form={form}
          formErrors={formErrors}
          updateForm={updateForm}
          isAuthenticated={isAuthenticated}
          isSubmitting={voteMutation.isPending}
          hasExistingVote={Boolean(myVote)}
          statusMessage={statusMessage}
          onSubmit={handleSubmit}
        />
      </div>
    </section>
  );
}
