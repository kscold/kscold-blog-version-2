'use client';

import { useEffect, useRef, useState } from 'react';
import { streamPageAnswer } from '../api/pageAgentStream';
import type { PageContext, PageMessage, PageStreamEvent } from './pageAgentTypes';

function updateAssistant(messages: PageMessage[], event: PageStreamEvent) {
  if (event.type !== 'delta' && event.type !== 'complete') return messages;
  return messages.map((message, index) => index === messages.length - 1 ? {
    ...message,
    content: event.type === 'delta' ? message.content + event.delta : event.answer,
    sourceIds: event.type === 'complete' ? event.sourceIds : message.sourceIds,
  } : message);
}

export function usePageAgent(context: PageContext) {
  const [messages, setMessages] = useState<PageMessage[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);

  async function send(question: string) {
    const message = question.trim();
    if (!message || message.length > 1200 || controller.current) return;
    const requestController = new AbortController();
    controller.current = requestController;
    setIsBusy(true); setError(''); setStatus('이 페이지의 자료를 확인하고 있습니다.');
    const id = crypto.randomUUID();
    setMessages(previous => [...previous, { id, role: 'user', content: message }, { id: `${id}-answer`, role: 'assistant', content: '' }]);
    let isComplete = false;
    const timeout = window.setTimeout(() => requestController.abort('timeout'), 70_000);
    try {
      await streamPageAnswer({ message, context, conversation: messages, signal: requestController.signal, onEvent: event => {
        if (event.type === 'error') throw new Error(event.message);
        if (event.type === 'stage') setStatus(event.detail);
        if (event.type === 'complete') isComplete = true;
        setMessages(previous => updateAssistant(previous, event));
      } });
      if (!isComplete) throw new Error('답변이 중간에 끊겼습니다. 다시 질문해 주세요.');
    } catch (reason) {
      const aborted = requestController.signal.aborted;
      setError(aborted ? (requestController.signal.reason === 'timeout' ? '응답 시간이 길어져 중단했습니다. 다시 시도해 주세요.' : '답변 생성을 중단했습니다.') : reason instanceof Error ? reason.message : '답변을 만들지 못했습니다.');
    } finally {
      window.clearTimeout(timeout);
      if (controller.current === requestController) controller.current = null;
      setIsBusy(false); setStatus('');
    }
  }

  function cancel() { controller.current?.abort('user'); }
  return { messages, isBusy, status, error, send, cancel };
}
