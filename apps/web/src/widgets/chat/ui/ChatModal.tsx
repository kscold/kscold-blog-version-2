'use client';

import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';
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
import { useChatDialog } from '../model/useChatDialog';
import { useChatViewport } from '../model/useChatViewport';
import { ChatNotice } from './ChatNotice';
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
  initialQuestion?: string;
}

export default function ChatModal({ isOpen, isElevated = false, onClose, initialQuestion }: ChatModalProps) {
  const { user } = useAuthStore();
  const router = useRouter();
  const panelRef = useChatDialog(isOpen, onClose);
  useChatViewport(isOpen, panelRef);
  const [inputMessage, setInputMessage] = useState('');
  const [mode, setMode] = useState<ChatMode>('agent');
  const [feedMemo, setFeedMemo] = useState('');
  const [feedSourceUrl, setFeedSourceUrl] = useState('');
  const draftViewer = useRef(user?.id);
  const hasCurrentDraft = draftViewer.current === user?.id;
  const {
    agentMessages,
    agentContentScope,
    isAgentThinking,
    isAgentHistoryLoading,
    agentHistoryError,
    retryHistory,
    agentInput,
    setAgentInput,
    submitAgentQuestion,
    suggestions,
    isFollowUp,
    isSuggestionsOpen,
    setIsSuggestionsOpen,
    startNewChat,
    canStartNewChat,
    cancelAgentResponse,
    retryLastQuestion,
    canRetryLastQuestion,
  } = useAgentChat(isOpen);

  useEffect(() => {
    if (!isOpen || !initialQuestion) return;
    setMode('agent');
    setAgentInput(initialQuestion);
    setIsSuggestionsOpen(false);
  }, [initialQuestion, isOpen, setAgentInput, setIsSuggestionsOpen]);

  const username = user?.displayName || user?.username || '';
  const ownerChat = useChatSocket({
    isOpen: isOpen && !!user && mode === 'owner',
    viewerId: user?.id || '',
  });
  const { messages, isConnected, sendMessage } = ownerChat;
  const modalPositionStyle = {
    '--chat-modal-bottom': isElevated
      ? 'calc(env(safe-area-inset-bottom, 0px) + 7.75rem)'
      : 'calc(env(safe-area-inset-bottom, 0px) + 2rem)',
    '--chat-modal-max-height': isElevated
      ? 'calc(100dvh - env(safe-area-inset-bottom, 0px) - 9.25rem)'
      : 'calc(100dvh - env(safe-area-inset-bottom, 0px) - 2.5rem)',
  } as CSSProperties;

  useEffect(() => {
    draftViewer.current = user?.id;
    setInputMessage('');
    setFeedMemo('');
    setFeedSourceUrl('');
  }, [user?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    const submitted = inputMessage;
    if (await sendMessage(submitted)) {
      setInputMessage(current => current === submitted ? '' : current);
    }
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
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed z-[1400] flex min-h-0 flex-col overflow-hidden border border-surface-200 bg-white shadow-2xl
                       inset-x-2 bottom-[calc(var(--chat-keyboard-inset,0px)+0.5rem)] h-[calc(var(--chat-visible-height,100dvh)-0.5rem)] max-h-[calc(var(--chat-visible-height,100dvh)-0.5rem)] rounded-[24px]
                       sm:inset-x-auto sm:bottom-[var(--chat-modal-bottom)] sm:right-4 sm:h-[720px] sm:max-h-[var(--chat-modal-max-height)] sm:w-[min(440px,calc(100vw-2rem))] sm:min-w-[360px] sm:max-w-[calc(100vw-2rem)] sm:resize sm:rounded-[24px] focus:outline-none"
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
                {agentHistoryError && <ChatNotice message={agentHistoryError} onRetry={retryHistory} />}
                <div className="shrink-0 border-t border-surface-200 bg-white p-3 sm:p-4">
                  <AgentSuggestions
                    suggestions={suggestions}
                    isFollowUp={isFollowUp}
                    isOpen={isSuggestionsOpen}
                    onToggle={() => setIsSuggestionsOpen(open => !open)}
                    onPick={prompt => void submitAgentQuestion(prompt)}
                    disabled={isAgentThinking || isAgentHistoryLoading || !!agentHistoryError}
                  />
                  <AgentComposer
                    value={agentInput}
                    isThinking={isAgentThinking}
                    onStop={cancelAgentResponse}
                    onRetry={() => void retryLastQuestion()}
                    canRetry={canRetryLastQuestion}
                    disabled={
                      !agentInput.trim() || isAgentThinking || isAgentHistoryLoading || !!agentHistoryError
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
                  memo={hasCurrentDraft ? feedMemo : ''}
                  onMemoChange={setFeedMemo}
                  sourceUrl={hasCurrentDraft ? feedSourceUrl : ''}
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
                {ownerChat.isLoading && <ChatNotice message="이전 메시지를 불러오고 있어요." />}
                {ownerChat.historyError && <ChatNotice message={ownerChat.historyError} onRetry={ownerChat.retryHistory} />}
                {ownerChat.sendError && <ChatNotice message={ownerChat.sendError} />}
                <ChatComposer
                  value={hasCurrentDraft ? inputMessage : ''}
                  placeholder={
                    ownerChat.isSending ? '전송을 확인하고 있어요...' : '블로그 주인에게 메시지 남기기...'
                  }
                  disabled={!inputMessage.trim() || ownerChat.isSending || ownerChat.isLoading}
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
