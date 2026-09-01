'use client';

import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/entities/user';
import {
  FeedCopilotPanel,
  stageFeedCopilotDraft,
  type FeedCopilotDraft,
} from '@/features/feed-copilot';
import { useChatSocket } from '@/features/chat';
import { useAgentChat } from '../model/useAgentChat';
import ChatMessageList from './ChatMessageList';
import { ChatComposer } from './ChatComposer';
import { ChatModalHeader } from './ChatModalHeader';
import { AgentMessageList } from './AgentMessageList';
import { AgentSuggestions } from './AgentSuggestions';
import { AgentComposer } from './AgentComposer';
import { ChatAccessGate } from './ChatAccessGate';
import { ChatModeTabs, type ChatMode } from './ChatModeTabs';

interface ChatModalProps {
  isOpen: boolean;
  isElevated?: boolean;
  onClose: () => void;
}

export default function ChatModal({ isOpen, isElevated = false, onClose }: ChatModalProps) {
  const { user } = useAuthStore();
  const router = useRouter();
  const [inputMessage, setInputMessage] = useState('');
  const [mode, setMode] = useState<ChatMode>('agent');
  const [feedMemo, setFeedMemo] = useState('');
  const [feedSourceUrl, setFeedSourceUrl] = useState('');
  const {
    agentMessages,
    agentContentScope,
    isAgentThinking,
    isAgentHistoryLoading,
    agentInput,
    setAgentInput,
    submitAgentQuestion,
    suggestions,
    isFollowUp,
    isSuggestionsOpen,
    setIsSuggestionsOpen,
    startNewChat,
    canStartNewChat,
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

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

  const handleApplyFeedDraft = (draft: FeedCopilotDraft) => {
    stageFeedCopilotDraft(draft, feedSourceUrl);
    router.push('/feed');
    onClose();
  };

  const title =
    mode === 'agent'
      ? 'KSCOLD Agent와 대화'
      : mode === 'feed'
        ? '피드 초안 같이 만들기'
        : '블로그 주인과 대화';
  const subtitle =
    mode === 'agent'
      ? agentContentScope?.label || '기록을 찾아 답합니다'
      : mode === 'feed'
        ? '계획을 확인한 뒤 초안으로 가져갑니다'
        : undefined;

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
            role="dialog"
            aria-modal="true"
            aria-label={title}
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
              isConnected={mode !== 'owner' || isConnected}
              title={title}
              subtitle={subtitle}
              onClose={onClose}
              onNewChat={mode === 'agent' ? startNewChat : undefined}
              canNewChat={canStartNewChat && !isAgentThinking}
            />

            <ChatModeTabs mode={mode} onChange={setMode} />

            {/* 본문 */}
            {mode === 'agent' ? (
              <>
                <AgentMessageList messages={agentMessages} />
                <div className="shrink-0 border-t border-surface-200 bg-white p-3 sm:p-4">
                  <AgentSuggestions
                    suggestions={suggestions}
                    isFollowUp={isFollowUp}
                    isOpen={isSuggestionsOpen}
                    onToggle={() => setIsSuggestionsOpen(open => !open)}
                    onPick={prompt => void submitAgentQuestion(prompt)}
                    disabled={isAgentThinking || isAgentHistoryLoading}
                  />
                  <AgentComposer
                    value={agentInput}
                    disabled={
                      !agentInput.trim() || isAgentThinking || isAgentHistoryLoading
                    }
                    isLoadingHistory={isAgentHistoryLoading}
                    onChange={setAgentInput}
                    onSubmit={handleSendAgentMessage}
                  />
                </div>
              </>
            ) : mode === 'feed' && !user ? (
              <ChatAccessGate
                mode="feed"
                onAgentClick={() => setMode('agent')}
                onClose={onClose}
              />
            ) : mode === 'feed' ? (
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-surface-50 p-3 custom-scrollbar sm:p-4">
                <FeedCopilotPanel
                  variant="chat"
                  defaultOpen
                  memo={feedMemo}
                  onMemoChange={setFeedMemo}
                  sourceUrl={feedSourceUrl}
                  onSourceUrlChange={setFeedSourceUrl}
                  onApplyDraft={handleApplyFeedDraft}
                />
              </div>
            ) : !user ? (
              <ChatAccessGate
                mode="owner"
                onAgentClick={() => setMode('agent')}
                onClose={onClose}
              />
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
