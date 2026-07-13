'use client';

import {
  formatPhoneNumber,
  type BloomVoteFormErrors,
  type BloomVoteFormState,
  type UpdateBloomVoteForm,
} from './adminNightBloomForm';

interface BloomVoteContactFieldsProps {
  form: BloomVoteFormState;
  formErrors: BloomVoteFormErrors;
  updateForm: UpdateBloomVoteForm;
  isAuthenticated: boolean;
}

export function BloomVoteContactFields({
  form,
  formErrors,
  updateForm,
  isAuthenticated,
}: BloomVoteContactFieldsProps) {
  return (
    <>
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
    </>
  );
}
