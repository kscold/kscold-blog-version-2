'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/common/Button';

interface Message {
  id: string;
  user: {
    id: string | null;
    name: string;
  };
  content: string;
  type: 'TEXT' | 'SYSTEM';
  createdAt: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const { user } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const newSocket = io(API_URL, {
      transports: ['websocket'],
      reconnection: true,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      const username = user?.displayName || user?.username || '익명';
      newSocket.emit('join_room', { room: 'general', username });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('receive_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('user_count', (count: number) => {
      setOnlineUsers(count);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [isOpen, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim() || !socket || !isConnected) return;

    const username = user?.displayName || user?.username || '익명';

    socket.emit('send_message', {
      room: 'general',
      username,
      content: inputMessage.trim(),
    });

    setInputMessage('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1300]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Chat Modal - Premium Light */}
          <motion.div
            className="fixed bottom-24 right-6 z-[1400] w-[400px] h-[600px] bg-white border border-surface-200 rounded-[24px] shadow-2xl overflow-hidden flex flex-col"
            initial={{ opacity: 0, scale: 0.8, y: 100, x: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100, x: 50 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 30,
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-surface-200 bg-surface-50 flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface-900 rounded-full flex items-center justify-center shadow-sm">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-surface-900">실시간 채팅</h3>
                    <p className="text-xs text-surface-500 font-medium">
                      {isConnected ? '연결됨' : '연결 중...'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-200 text-surface-400 hover:text-surface-900 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Status Bar */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-surface-200 shadow-sm">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                    }`}
                  />
                  <span className="text-xs font-bold tracking-wide text-surface-600">
                    {onlineUsers} 명 접속
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-surface-50">
              <AnimatePresence initial={false}>
                {messages.map((message, index) => (
                  <motion.div
                    key={`${message.id}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={
                      message.type === 'SYSTEM'
                        ? 'text-center my-4'
                        : message.user.name === (user?.displayName || user?.username || '익명')
                          ? 'flex justify-end'
                          : 'flex justify-start'
                    }
                  >
                    {message.type === 'SYSTEM' ? (
                      <div className="inline-block px-4 py-1.5 bg-surface-200/50 rounded-full text-[11px] font-bold tracking-wider text-surface-500">
                        {message.content}
                      </div>
                    ) : (
                      <div className="max-w-[85%]">
                        <div className="text-[11px] font-bold text-surface-400 mb-1.5 px-1 tracking-wide">
                          {message.user.name}
                        </div>
                        <div
                          className={`px-4 py-2.5 rounded-[16px] shadow-sm ${
                            message.user.name === (user?.displayName || user?.username || '익명')
                              ? 'bg-surface-900 text-white rounded-tr-sm'
                              : 'bg-white text-surface-700 rounded-tl-sm border border-surface-200'
                          }`}
                        >
                          <p className="text-sm break-words leading-relaxed font-medium">
                            {message.content}
                          </p>
                        </div>
                        <div className="text-[10px] text-surface-400 mt-1.5 px-1 font-mono tracking-wider">
                          {new Date(message.createdAt).toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-surface-200 bg-white flex-shrink-0">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  placeholder={isConnected ? '메시지 입력...' : '연결 중...'}
                  disabled={!isConnected}
                  className="flex-1 px-4 py-3 rounded-xl bg-surface-50 border border-surface-200 text-surface-900 placeholder:text-surface-400 text-sm focus:outline-none focus:border-surface-900 focus:ring-1 focus:ring-surface-900 disabled:opacity-50 transition-all font-medium shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!isConnected || !inputMessage.trim()}
                  className="w-12 h-12 flex items-center justify-center bg-surface-900 hover:bg-surface-800 rounded-xl text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
