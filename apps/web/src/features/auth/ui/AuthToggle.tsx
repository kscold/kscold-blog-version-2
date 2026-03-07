'use client';

import { motion } from 'framer-motion';

interface AuthToggleProps {
  isLogin: boolean;
  onToggle: (isLogin: boolean) => void;
}

export function AuthToggle({ isLogin, onToggle }: AuthToggleProps) {
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="relative inline-flex bg-surface-100/80 p-1 rounded-xl">
        <motion.div
          className="absolute h-[calc(100%-8px)] bg-white rounded-lg shadow-sm transition-all duration-300"
          initial={false}
          animate={{
            width: 'calc(50% - 4px)',
            x: isLogin ? 4 : 'calc(100% + 4px)',
          }}
        />
        <button
          type="button"
          onClick={() => onToggle(true)}
          className={`relative z-10 px-6 py-2 text-sm font-semibold transition-colors duration-300 ${
            isLogin ? 'text-surface-900' : 'text-surface-500'
          }`}
        >
          로그인
        </button>
        <button
          type="button"
          onClick={() => onToggle(false)}
          className={`relative z-10 px-6 py-2 text-sm font-semibold transition-colors duration-300 ${
            !isLogin ? 'text-surface-900' : 'text-surface-500'
          }`}
        >
          회원가입
        </button>
      </div>
    </div>
  );
}
