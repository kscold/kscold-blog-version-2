'use client';

import { useEffect, useRef, useState } from 'react';
import { useStoredString } from '@/shared/lib/useBrowserSnapshot';
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

  const stored = useStoredString(STORAGE_KEY);
  let saved: { id?: string; submitted?: boolean } | null = null;
  try { saved = JSON.parse(stored || 'null'); } catch { /* 저장 실패는 새 제출을 막지 않는다. */ }
  const savedId = saved?.id;
  useEffect(() => {
    if (savedId) submissionId.current = savedId;
  }, [savedId]);


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

  return { draft, setDraft, submitted: submitted || saved?.submitted === true, pending, error, submit };
}
