'use client';

import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import {
  fetchVaultAgentHistory, getOrCreateAgentSessionId, isValidAgentSessionId,
  rememberAgentSessionId, type AgentMessage,
} from '@/features/chat';

interface Options {
  isOpen: boolean;
  viewerId: string | null;
  setMessages: Dispatch<SetStateAction<AgentMessage[]>>;
  setSessionId: Dispatch<SetStateAction<string>>;
}

export function useAgentHistory({ isOpen, viewerId, setMessages, setSessionId }: Options) {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const version = useRef(0);

  useEffect(() => {
    if (!isOpen || hasLoaded) return;
    const sessionId = getOrCreateAgentSessionId();
    const current = ++version.current;
    void fetchVaultAgentHistory(sessionId).then(history => {
      if (current !== version.current) return;
      setSessionId(sessionId);
      setError('');
      if (isValidAgentSessionId(history.sessionId)) {
        rememberAgentSessionId(history.sessionId);
        setSessionId(history.sessionId);
      }
      if (history.messages.length) setMessages(history.messages);
      setHasLoaded(true);
    }).catch(() => {
      if (current === version.current) {
        setError('이전 대화를 불러오지 못했어요. 다시 불러오거나 새 채팅을 시작해 주세요.');
      }
    });
    return () => { version.current += 1; };
  }, [attempt, hasLoaded, isOpen, viewerId, setMessages, setSessionId]);

  const resetHistory = useCallback((loaded: boolean) => {
    version.current += 1;
    setError('');
    setHasLoaded(loaded);
    if (!loaded) setAttempt(value => value + 1);
  }, []);
  const retryHistory = () => {
    setError('');
    setAttempt(value => value + 1);
  };
  return { hasLoaded, error, resetHistory, retryHistory };
}
