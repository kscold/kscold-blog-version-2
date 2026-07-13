'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useWithdrawAccount } from '@/features/profile';
import { useAuthStore } from '@/entities/user';
import { useAlert } from '@/shared/model/alertStore';
import { apiClient } from '@/shared/api/api-client';

interface WithdrawModalProps {
  open: boolean;
  onClose: () => void;
}

const CONFIRM_PHRASE = '탈퇴합니다';

export function WithdrawModal({ open, onClose }: WithdrawModalProps) {
  const router = useRouter();
  const alert = useAlert();
  const withdrawAccount = useWithdrawAccount();
  const { setUser, setToken } = useAuthStore();
  const [confirmInput, setConfirmInput] = useState('');

  const handleClose = () => {
    setConfirmInput('');
    onClose();
  };

  const handleWithdraw = async () => {
    if (confirmInput !== CONFIRM_PHRASE) return;
    try {
      await withdrawAccount.mutateAsync();
      apiClient.removeToken();
      setToken('');
      setUser(null as never);
      router.replace('/');
    } catch {
      alert.error('탈퇴 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-surface-900 mb-1">정말 탈퇴하시겠어요?</h3>
            <p className="text-sm text-surface-500 mb-4">
              탈퇴 시 계정이 즉시 비활성화됩니다. 개인정보처리방침에 따라 데이터는 보관 기간 후 삭제됩니다.
            </p>
            <p className="text-xs font-medium text-surface-700 mb-2">
              확인을 위해 아래에 <span className="font-bold text-red-600">{CONFIRM_PHRASE}</span>를 입력해 주세요.
            </p>
            <input
              value={confirmInput}
              onChange={e => setConfirmInput(e.target.value)}
              placeholder={CONFIRM_PHRASE}
              className="w-full px-3 py-2.5 text-sm border border-surface-200 rounded-xl focus:outline-none focus:border-red-400 transition-colors mb-4"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium border border-surface-200 rounded-xl hover:bg-surface-50 transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleWithdraw}
                disabled={confirmInput !== CONFIRM_PHRASE || withdrawAccount.isPending}
                className="flex-1 px-4 py-2.5 text-sm font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {withdrawAccount.isPending ? '처리 중...' : '탈퇴 확인'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
