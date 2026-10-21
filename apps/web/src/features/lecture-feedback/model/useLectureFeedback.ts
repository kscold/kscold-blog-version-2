'use client';

import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { FeedbackDraft } from './questions';

const STORAGE_KEY = 'hansalim-feedback-20261021';
const emptyDraft: FeedbackDraft = { ratings: {}, pace: '', helpful: [], comment: '' };

export function useLectureFeedback() {
  const [draft, setDraft] = useState<FeedbackDraft>(emptyDraft);
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const submissionId = useRef('');
  const locked = useRef(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (saved?.id) submissionId.current = saved.id;
      if (saved?.submitted === true) setSubmitted(true);
    } catch { /* 저장 공간을 쓸 수 없어도 설문 제출은 가능하다. */ }
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked.current) return;
    locked.current = true;
    setPending(true);
    setError('');
    submissionId.current ||= crypto.randomUUID();
    try {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: submissionId.current }));
      } catch { /* 브라우저 저장 실패가 서버 제출을 막지 않도록 한다. */ }
      const response = await fetch('/api/lectures/hansalim/feedback', {
        method: 'POST', credentials: 'omit',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...draft, submissionId: submissionId.current }),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error('submit-failed');
      const result = await response.json();
      if (!result.success) throw new Error('submit-failed');
      setSubmitted(true);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: submissionId.current, submitted: true }));
      } catch { /* 완료 화면은 저장 공간과 관계없이 표시한다. */ }
    } catch {
      setError('응답을 저장하지 못했어요. 선택한 내용은 그대로 있으니 잠시 후 다시 제출해주세요.');
    } finally {
      locked.current = false;
      setPending(false);
    }
  }

  return { draft, setDraft, submitted, pending, error, submit };
}
