'use client';

import type {
  AdminNightProgramExperienceLevel,
  AdminNightProgramFoodPreference,
  AdminNightProgramInterestLevel,
  AdminNightProgramPreferredDay,
  AdminNightProgramSessionLength,
  AdminNightProgramSessionStyle,
} from '@/entities/admin-night/model/types';
import {
  AI_AGENT_BLOOM_DAY_OPTIONS,
  AI_AGENT_BLOOM_EXPERIENCE_OPTIONS,
  AI_AGENT_BLOOM_FOOD_OPTIONS,
  AI_AGENT_BLOOM_INTEREST_OPTIONS,
  AI_AGENT_BLOOM_SESSION_LENGTH_OPTIONS,
  AI_AGENT_BLOOM_SESSION_STYLE_OPTIONS,
  AI_AGENT_BLOOM_TIME_OPTIONS,
  AI_AGENT_BLOOM_TOPIC_OPTIONS,
} from '@/widgets/admin-night/lib/adminNight';
import {
  toggleValue,
  type BloomVoteFormErrors,
  type BloomVoteFormState,
  type UpdateBloomVoteForm,
} from './adminNightBloomForm';
import { MultiSelectGrid, OptionButtonGroup } from './BloomSelectGroups';

interface BloomVotePreferenceFieldsProps {
  form: BloomVoteFormState;
  formErrors: BloomVoteFormErrors;
  updateForm: UpdateBloomVoteForm;
}

export function BloomVotePreferenceFields({
  form,
  formErrors,
  updateForm,
}: BloomVotePreferenceFieldsProps) {
  return (
    <>
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
    </>
  );
}
