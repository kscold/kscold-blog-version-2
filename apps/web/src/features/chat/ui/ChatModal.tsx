'use client';

import type { CSSProperties } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/entities/user/model/authStore';
import { useChatSocket } from '@/features/chat/lib/useChatSocket';
import { useAgentChat } from '@/features/chat/model/useAgentChat';
import ChatMessageList from '@/features/chat/ui/ChatMessageList';
import { ChatComposer } from './ChatComposer';
import { ChatModalHeader } from './ChatModalHeader';
import { AgentMessageList } from './AgentMessageList';
import { AgentSuggestions } from './AgentSuggestions';
import { AgentComposer } from './AgentComposer';

interface ChatModalProps {
  isOpen: boolean;
  isElevated?: boolean;
  onClose: () => void;
}

type ChatMode = 'agent' | 'owner';

export default function ChatModal({ isOpen, isElevated = false, onClose }: ChatModalProps) {
  const { user } = useAuthStore();
  const [inputMessage, setInputMessage] = useState('');
  const [mode, setMode] = useState<ChatMode>('agent');
  const {
    agentMessages,
    isAgentThinking,
    agentInput,
    setAgentInput,
    submitAgentQuestion,
    suggestions,
    isFollowUp,
    isSuggestionsOpen,
    setIsSuggestionsOpen,
  } = useAgentChat(isOpen);

  const username = user?.displayName || user?.username || '';
  const { messages, isConnected, sendMessage } = useChatSocket({
    isOpen: isOpen && !!user && mode === 'owner',
    username,
  });
  const modalPositionStyle = {
    '--chat-modal-bottom': isElevated
      ? 'calc(env(safe-area-inset-bottom, 0px) + 7.75rem)'
      : 'calc(env(safe-area-inset-bottom, 0px) + 2rem)',
    '--chat-modal-max-height': isElevated
      ? 'calc(100dvh - env(safe-area-inset-bottom, 0px) - 9.25rem)'
      : 'calc(100dvh - env(safe-area-inset-bottom, 0px) - 2.5rem)',
  } as CSSProperties;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    await sendMessage(inputMessage);
    setInputMessage('');
  };

  const handleSendAgentMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    void submitAgentQuestion(agentInput);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 오버레이 */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1300]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* 모달: 모바일 전체화면 / 데스크탑 우하단 고정 */}
          <motion.div
            className="fixed z-[1400] flex min-h-0 flex-col overflow-hidden border border-surface-200 bg-white shadow-2xl
                       inset-x-2 bottom-2 h-[calc(100dvh-0.5rem)] max-h-[calc(100dvh-0.5rem)] rounded-[24px]
                       sm:inset-x-auto sm:bottom-[var(--chat-modal-bottom)] sm:right-4 sm:h-[720px] sm:max-h-[var(--chat-modal-max-height)] sm:w-[min(440px,calc(100vw-2rem))] sm:min-h-[480px] sm:min-w-[360px] sm:max-w-[calc(100vw-2rem)] sm:resize sm:rounded-[24px]"
            style={modalPositionStyle}
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={e => e.stopPropagation()}
          >
            <ChatModalHeader
              isConnected={mode === 'agent' || isConnected}
              title={mode === 'agent' ? 'KSCOLD Agent와 대화' : '블로그 주인과 대화'}
              subtitle={mode === 'agent' ? '공개 콘텐츠 RAG 모드' : undefined}
              onClose={onClose}
            />

            <div className="grid shrink-0 grid-cols-2 gap-2 border-b border-surface-200 bg-white px-3 py-2.5 sm:px-4 sm:py-3">
              <button
                type="button"
                onClick={() => setMode('agent')}
                className={`min-w-0 rounded-xl px-2 py-2 text-xs font-black transition sm:px-3 ${
                  mode === 'agent'
                    ? 'bg-surface-900 text-white'
                    : 'bg-surface-50 text-surface-500 hover:bg-surface-100 hover:text-surface-900'
                }`}
              >
                Agent에게 묻기
              </button>
              <button
                type="button"
                onClick={() => setMode('owner')}
                className={`min-w-0 rounded-xl px-2 py-2 text-xs font-black transition sm:px-3 ${
                  mode === 'owner'
                    ? 'bg-surface-900 text-white'
                    : 'bg-surface-50 text-surface-500 hover:bg-surface-100 hover:text-surface-900'
                }`}
              >
                주인에게 남기기
              </button>
            </div>

            {/* 본문 */}
            {mode === 'agent' ? (
              <>
                <AgentMessageList messages={agentMessages} isThinking={isAgentThinking} />
                <div className="shrink-0 border-t border-surface-200 bg-white p-3 sm:p-4">
                  <AgentSuggestions
                    suggestions={suggestions}
                    isFollowUp={isFollowUp}
                    isOpen={isSuggestionsOpen}
                    onToggle={() => setIsSuggestionsOpen(open => !open)}
                    onPick={prompt => void submitAgentQuestion(prompt)}
                    disabled={isAgentThinking}
                  />
                  <AgentComposer
                    value={agentInput}
                    disabled={!agentInput.trim() || isAgentThinking}
                    onChange={setAgentInput}
                    onSubmit={handleSendAgentMessage}
                  />
                </div>
              </>
            ) : !user ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-surface-50 p-6">
                <div className="text-center">
                  <p className="text-sm font-bold text-surface-900">
                    주인에게 메시지를 남기려면 로그인이 필요해요
                  </p>
                  <p className="mt-1 text-xs leading-5 text-surface-400">
                    로그인 없이 궁금한 내용은 Agent에게 바로 물어볼 수 있습니다.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('agent')}
                    className="rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm font-semibold text-surface-700 transition hover:border-surface-900 hover:text-surface-900"
                  >
                    Agent로 묻기
                  </button>
                  <Link
                    href="/login"
                    onClick={onClose}
                    className="rounded-xl bg-surface-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-surface-800"
                  >
                    로그인
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <ChatMessageList messages={messages} currentUsername={username} />
                <ChatComposer
                  value={inputMessage}
                  placeholder={
                    isConnected ? '메시지를 입력하세요...' : '네트워크가 불안정해도 전송됩니다'
                  }
                  disabled={!inputMessage.trim()}
                  onChange={setInputMessage}
                  onSubmit={handleSendMessage}
                />
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
