'use client';

import { useFeedbackResults } from '../api/useFeedbackResults';
import { HELPFUL_TOPICS, PACE_OPTIONS, RATING_QUESTIONS } from '../model/questions';

export function FeedbackResults() {
  const query = useFeedbackResults();
  const responses = query.data ?? [];
  if (query.isLoading) return <p role="status">설문 응답을 불러오는 중입니다.</p>;
  if (query.isError) return <p role="alert">결과를 불러오지 못했습니다. 관리자 로그인 상태를 확인해주세요.</p>;
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-surface-500">최근 응답 {responses.length}개 · 최대 1,000개 · 1분마다 갱신</p>
        <button onClick={() => query.refetch()} className="min-h-11 rounded-xl border border-surface-300 bg-white px-4 text-sm font-bold">새로고침</button>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {RATING_QUESTIONS.map(question => (
          <div key={question.key} className="rounded-2xl border border-surface-200 bg-white p-5">
            <p className="text-xs leading-5 text-surface-500">{question.title}</p>
            <p className="mt-4 text-3xl font-black tabular-nums text-primary-700">
              {responses.length ? (responses.reduce((sum, item) => sum + item.ratings[question.key], 0) / responses.length).toFixed(1) : '—'}
              <span className="ml-1 text-sm font-normal text-surface-400">/ 5</span>
            </p>
          </div>
        ))}
      </div>
      {!responses.length && <p className="py-8 text-center text-surface-500">아직 제출된 응답이 없습니다.</p>}
      {responses.map((item, index) => (
        <article key={item.id} className="rounded-2xl border border-surface-200 bg-white p-5">
          <div className="flex flex-wrap justify-between gap-2 text-xs text-surface-500">
            <span>응답 {responses.length - index}</span><time>{new Date(item.createdAt).toLocaleString('ko-KR')}</time>
          </div>
          <p className="mt-3 text-sm text-surface-700">진행 속도: {PACE_OPTIONS.find(option => option.key === item.pace)?.title}</p>
          <p className="mt-2 text-sm text-surface-600">도움이 된 내용: {item.helpful.map(key => HELPFUL_TOPICS.find(topic => topic.key === key)?.title).join(' · ') || '선택 안 함'}</p>
          <p className="mt-4 whitespace-pre-wrap break-words leading-7 text-surface-900">{item.comment || '자유 의견 없음'}</p>
        </article>
      ))}
    </section>
  );
}
