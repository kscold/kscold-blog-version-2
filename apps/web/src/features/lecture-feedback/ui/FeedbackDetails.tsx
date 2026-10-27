import type { FeedbackDraft } from '../model/questions';
import { HELPFUL_TOPICS, PACE_OPTIONS } from '../model/questions';

interface FeedbackDetailsProps {
  draft: FeedbackDraft;
  onChange: (draft: FeedbackDraft) => void;
}

const card = 'rounded-2xl border border-surface-200 bg-white p-5 sm:p-7';

export function FeedbackDetails({ draft, onChange }: FeedbackDetailsProps) {
  return (
    <>
      <fieldset className={card}>
        <legend className="sr-only">강의 진행 속도는 어떠셨나요?</legend>
        <p className="mb-4 font-bold text-surface-900" aria-hidden>강의 진행 속도는 어떠셨나요? <span className="text-primary-700">*</span></p>
        <div className="grid gap-2 sm:grid-cols-3">
          {PACE_OPTIONS.map(option => (
            <label key={option.key} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-surface-200 px-4 py-3 text-sm has-checked:border-primary-600 has-checked:bg-primary-50">
              <input type="radio" name="pace" value={option.key} checked={draft.pace === option.key}
                onChange={() => onChange({ ...draft, pace: option.key })} required className="h-4 w-4 accent-primary-700" />
              {option.title}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className={card}>
        <legend className="sr-only">가장 도움이 된 내용</legend>
        <p className="font-bold text-surface-900" aria-hidden>어떤 내용이 특히 도움이 되었나요?</p>
        <p className="mb-4 mt-1 text-sm text-surface-500">선택 사항 · 여러 개를 골라도 좋아요.</p>
        <div className="space-y-2">
          {HELPFUL_TOPICS.map(topic => (
            <label key={topic.key} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-surface-50">
              <input type="checkbox" checked={draft.helpful.includes(topic.key)}
                onChange={event => onChange({ ...draft, helpful: event.target.checked ? [...draft.helpful, topic.key] : draft.helpful.filter(key => key !== topic.key) })}
                className="h-5 w-5 accent-primary-700" />
              <span className="text-sm text-surface-700">{topic.title}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className={card}>
        <label htmlFor="feedback-comment" className="font-bold text-surface-900">다음 강의를 위해 한마디 남겨주세요</label>
        <p id="comment-help" className="mb-4 mt-2 text-sm leading-6 text-surface-500">좋았던 점, 아쉬웠던 점, 더 배우고 싶은 내용 모두 좋아요. 이름이나 연락처 등 개인정보는 적지 말아주세요.</p>
        <textarea id="feedback-comment" value={draft.comment} maxLength={1000} rows={5}
          aria-describedby="comment-help" onChange={event => onChange({ ...draft, comment: event.target.value })}
          placeholder="자유롭게 남겨주세요. (선택)"
          className="w-full resize-y rounded-xl border border-surface-300 bg-white p-4 text-base leading-7 outline-hidden focus:border-primary-600 focus:ring-2 focus:ring-primary-100" />
        <p className="mt-2 text-right text-xs tabular-nums text-surface-500">{draft.comment.length} / 1,000</p>
      </div>
    </>
  );
}
