'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface FloatingChatButtonProps {
  onClick: () => void;
  unreadCount?: number;
}

export default function FloatingChatButton({ onClick, unreadCount = 0 }: FloatingChatButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="fixed right-4 z-[1200] group sm:right-6"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* 글로우 효과 */}
      <div className="absolute inset-x-0 -bottom-2 h-full bg-surface-900/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* 버튼 */}
      <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-surface-800 bg-surface-900 shadow-xl shadow-surface-900/10 transition-all duration-300 hover:bg-surface-800 sm:h-16 sm:w-16">
        {/* 채팅 아이콘 */}
        <AnimatePresence mode="wait">
          {!isHovered ? (
            <motion.svg
              key="chat"
            className="h-7 w-7 text-white sm:h-8 sm:w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </motion.svg>
          ) : (
            <motion.svg
              key="message"
              className="h-7 w-7 text-white sm:h-8 sm:w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
              />
            </motion.svg>
          )}
        </AnimatePresence>

        {/* 안 읽은 메시지 배지 */}
        {unreadCount > 0 && (
          <motion.div
            className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500 }}
          >
            <span className="text-xs font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </motion.div>
        )}
      </div>

      {/* 툴팁 */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute bottom-full right-0 mb-3 hidden whitespace-nowrap rounded-xl border border-surface-200 bg-white px-4 py-2 text-xs font-bold tracking-wide text-surface-900 shadow-lg sm:block"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            실시간 채팅
            <div className="absolute top-full right-6 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-white drop-shadow-sm" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
