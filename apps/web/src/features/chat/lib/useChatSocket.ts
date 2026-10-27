'use client';

import { useEffect, useRef, useState } from 'react';
import { fetchMyChatMessages, sendVisitorMessage, type VisitorChatMessage } from '@/entities/chat';
import { subscribeVisitorChat, mergeChatMessages } from './visitorChatConnection';

interface Options { isOpen: boolean; viewerId: string }

export function useChatSocket({ isOpen, viewerId }: Options) {
  const [messages, setMessages] = useState<VisitorChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(isOpen);
  const [historyError, setHistoryError] = useState('');
  const [sendError, setSendError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const generation = useRef(0);
  const pending = useRef(false);
  const [owner, setOwner] = useState({ viewerId, isOpen, attempt });
  if (owner.viewerId !== viewerId || owner.isOpen !== isOpen || owner.attempt !== attempt) {
    if (owner.viewerId !== viewerId || owner.isOpen !== isOpen) {
      setMessages([]);
      setSendError('');
      setIsSending(false);
      setIsConnected(false);
    }
    setOwner({ viewerId, isOpen, attempt });
    setIsLoading(isOpen);
    setHistoryError('');
  }

  useEffect(() => {
    pending.current = false;
    const current = ++generation.current;
    if (!isOpen) return;
    const active = () => current === generation.current;
    const disconnect = subscribeVisitorChat({
      viewerId,
      onMessages: incoming => {
        if (active()) setMessages(previous => mergeChatMessages(previous, incoming));
      },
      onConnection: connected => { if (active()) setIsConnected(connected); },
    });
    return () => {
      generation.current += 1;
      disconnect();
      setIsConnected(false);
    };
  }, [isOpen, viewerId]);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    const current = generation.current;
    void fetchMyChatMessages().then(history => {
      if (active && current === generation.current) {
        setMessages(previous => mergeChatMessages(history, previous));
      }
    }).catch(() => {
      if (active && current === generation.current) setHistoryError('이전 메시지를 불러오지 못했어요.');
    }).finally(() => {
      if (active && current === generation.current) setIsLoading(false);
    });
    return () => { active = false; };
  }, [attempt, isOpen, viewerId]);

  const sendMessage = async (content: string): Promise<boolean> => {
    if (!isOpen || !content.trim() || pending.current || owner.viewerId !== viewerId) return false;
    const current = generation.current;
    pending.current = true;
    setIsSending(true);
    setSendError('');
    try {
      // 서버의 저장 응답을 받은 뒤 입력을 지운다. 실시간 에코와 응답은 ID로 합친다.
      const saved = await sendVisitorMessage(content.trim());
      if (current !== generation.current) return false;
      setMessages(previous => mergeChatMessages(previous, [saved]));
      return true;
    } catch {
      if (current === generation.current) {
        setSendError('전송 확인을 받지 못했어요. 입력은 보관했어요. 대화에 도착했는지 확인한 뒤 다시 보내 주세요.');
      }
      return false;
    } finally {
      if (current === generation.current) {
        pending.current = false;
        setIsSending(false);
      }
    }
  };

  return {
    messages: owner.viewerId === viewerId ? messages : [], isConnected, isSending,
    isLoading, historyError, sendError, sendMessage,
    retryHistory: () => setAttempt(value => value + 1),
  };
}
