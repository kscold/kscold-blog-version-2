'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuthStore } from '@/entities/user/model/authStore';
import { useChatSocket } from '@/features/chat/lib/useChatSocket';
import ChatMessageList from '@/features/chat/ui/ChatMessageList';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const { user } = useAuthStore();
  const [inputMessage, setInputMessage] = useState('');

  const username = user?.displayName || user?.username || '';
  const { messages, isConnected, sendMessage } = useChatSocket({
    isOpen: isOpen && !!user,
    username,
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    sendMessage(inputMessage);
    setInputMessage('');
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
            className="fixed z-[1400] bg-white border border-surface-200 shadow-2xl overflow-hidden flex flex-col
                       inset-x-0 bottom-0 rounded-t-[24px] h-[85dvh]
                       sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[400px] sm:h-[600px] sm:rounded-[24px]"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={e => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="p-4 border-b border-surface-200 bg-surface-50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface-900 rounded-full flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-surface-900">블로그 주인과 대화</h3>
                    {user && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-surface-300'}`} />
                        <span className="text-xs text-surface-500 font-medium">
                          {isConnected ? '연결됨' : '연결 중...'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-200 text-surface-400 hover:text-surface-900 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 본문 */}
            {!user ? (
              /* 로그인 게이트 */
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 bg-surface-50">
                <div className="w-14 h-14 bg-surface-100 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-surface-900">로그인이 필요합니다</p>
                  <p className="text-xs text-surface-400 mt-1">채팅을 이용하려면 먼저 로그인해 주세요.</p>
                </div>
                <Link
                  href="/login"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-surface-900 text-white text-sm font-semibold rounded-xl hover:bg-surface-800 transition-colors"
                >
                  로그인하러 가기
                </Link>
              </div>
            ) : (
              <>
                <ChatMessageList messages={messages} currentUsername={username} />

                {/* 입력창 */}
                <div className="p-4 border-t border-surface-200 bg-white flex-shrink-0">
                  <form onSubmit={handleSendMessage} className="flex gap-2.5">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={e => setInputMessage(e.target.value)}
                      placeholder={isConnected ? '메시지를 입력하세요...' : '연결 중...'}
                      disabled={!isConnected}
                      autoComplete="off"
                      className="flex-1 px-4 py-3 rounded-xl bg-surface-50 border border-surface-200 text-surface-900 placeholder:text-surface-400 text-sm focus:outline-none focus:border-surface-900 focus:ring-1 focus:ring-surface-900 disabled:opacity-50 transition-all font-medium"
                    />
                    <button
                      type="submit"
                      disabled={!isConnected || !inputMessage.trim()}
                      className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-surface-900 hover:bg-surface-800 rounded-xl text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
