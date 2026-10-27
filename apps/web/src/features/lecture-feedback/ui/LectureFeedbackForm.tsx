'use client';

import Link from 'next/link';
import { RATING_QUESTIONS } from '../model/questions';
import { useLectureFeedback } from '../model/useLectureFeedback';
import { RatingQuestion } from './RatingQuestion';
import { FeedbackDetails } from './FeedbackDetails';

export function LectureFeedbackForm() {
  const { draft, setDraft, submitted, pending, error, submit } = useLectureFeedback();
  const completed = Object.keys(draft.ratings).length + (draft.pace ? 1 : 0);
  if (submitted) return (
    <section role="status" className="rounded-3xl border border-primary-200 bg-white px-6 py-12 text-center sm:p-12">
      <div aria-hidden className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-3xl text-primary-700">✓</div>
      <h2 className="text-2xl font-bold tracking-tight text-surface-900">의견을 잘 받았어요</h2>
      <p className="mt-4 break-keep leading-7 text-surface-600">함께해 주셔서 감사합니다.<br />남겨주신 의견은 다음 강의를 준비할 때 참고하겠습니다.</p>
      <Link href="/hansalim" className="mt-8 inline-flex min-h-12 items-center rounded-full bg-surface-900 px-6 font-bold text-white">강의 자료로 돌아가기 →</Link>
    </section>
  );
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="mb-6">
        <div className="mb-3 flex justify-between text-sm text-surface-500"><span>필수 질문 5개</span><span>{completed} / 5 완료</span></div>
        <progress value={completed} max={5} aria-label="필수 질문 응답 진행률" className="h-1.5 w-full overflow-hidden rounded-full accent-primary-600" />
      </div>
      <fieldset disabled={pending} className="space-y-4 disabled:opacity-60">
        <legend className="sr-only">강의 만족도 설문</legend>
        {RATING_QUESTIONS.map(question => (
          <RatingQuestion key={question.key} question={question} value={draft.ratings[question.key]}
            onChange={value => setDraft({ ...draft, ratings: { ...draft.ratings, [question.key]: value } })} />
        ))}
        <FeedbackDetails draft={draft} onChange={setDraft} />
      </fieldset>
      <p className="px-1 pt-2 text-xs leading-6 text-surface-500">응답은 강의 개선을 위해 저장되며 강사만 확인합니다. 이름·연락처·로그인 정보는 응답에 저장하지 않습니다.</p>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm leading-6 text-red-700">{error}</p>}
      <button type="submit" disabled={pending} className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-primary-700 px-6 text-base font-bold text-white transition-colors hover:bg-primary-800 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-700 disabled:cursor-wait disabled:opacity-60">
        {pending ? '의견을 보내는 중…' : '의견 보내기'}
      </button>
      <p className="text-center text-xs text-surface-500">저장이 완료되면 확인 화면이 나타납니다.</p>
    </form>
  );
}
