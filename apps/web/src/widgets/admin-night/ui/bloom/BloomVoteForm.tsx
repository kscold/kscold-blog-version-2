'use client';

import type {
  BloomVoteFormErrors,
  BloomVoteFormState,
  UpdateBloomVoteForm,
} from './adminNightBloomForm';
import { BloomVoteContactFields } from './BloomVoteContactFields';
import { BloomVotePreferenceFields } from './BloomVotePreferenceFields';

interface BloomVoteFormProps {
  form: BloomVoteFormState;
  formErrors: BloomVoteFormErrors;
  updateForm: UpdateBloomVoteForm;
  isAuthenticated: boolean;
  isSubmitting: boolean;
  hasExistingVote: boolean;
  statusMessage: string | null;
  onSubmit: () => void;
}

export function BloomVoteForm({
  form,
  formErrors,
  updateForm,
  isAuthenticated,
  isSubmitting,
  hasExistingVote,
  statusMessage,
  onSubmit,
}: BloomVoteFormProps) {
  return (
    <div className="border-t border-white/10 bg-white p-6 text-surface-900 sm:p-8 xl:border-l xl:border-t-0">
      <div className="space-y-2">
        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-surface-400">Interest Form</p>
        <h3 className="text-2xl font-black tracking-tight">AI Agent Bloom 투표</h3>
        <p className="text-sm leading-7 text-surface-500">
          오프라인으로 진행할 예정입니다. 아직 신청 확정은 아니고, 먼저 관심도와 가능한 시간을 모으는 단계입니다.
        </p>
      </div>

      <div className="mt-6 space-y-5">
        <BloomVoteContactFields
          form={form}
          formErrors={formErrors}
          updateForm={updateForm}
          isAuthenticated={isAuthenticated}
        />

        <BloomVotePreferenceFields form={form} formErrors={formErrors} updateForm={updateForm} />

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-surface-900 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-surface-800 disabled:cursor-not-allowed disabled:bg-surface-300"
        >
          {isSubmitting ? '투표 저장 중…' : hasExistingVote ? '투표 다시 저장하기' : '관심 투표 남기기'}
        </button>

        {statusMessage && (
          <p className="rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm leading-6 text-surface-600">
            {statusMessage}
          </p>
        )}
      </div>
    </div>
  );
}
