'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertItem, AlertType, useAlertStore } from '@/shared/model/alertStore';

const ICONS: Record<AlertType, React.ReactNode> = {
  success: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
    </svg>
  ),
};

const STYLES: Record<AlertType, string> = {
  success: 'bg-white border-emerald-200 text-emerald-700 [&_.icon-wrap]:bg-emerald-50 [&_.icon-wrap]:text-emerald-600',
  error:   'bg-white border-red-200 text-red-700 [&_.icon-wrap]:bg-red-50 [&_.icon-wrap]:text-red-600',
  warning: 'bg-white border-amber-200 text-amber-700 [&_.icon-wrap]:bg-amber-50 [&_.icon-wrap]:text-amber-600',
  info:    'bg-white border-blue-200 text-blue-700 [&_.icon-wrap]:bg-blue-50 [&_.icon-wrap]:text-blue-600',
};

function ToastItem({ alert }: { alert: AlertItem }) {
  const { dismissAlert } = useAlertStore();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 480, damping: 36 }}
      className={`
        flex items-start gap-3 w-80 px-4 py-3.5 rounded-2xl border shadow-md
        ${STYLES[alert.type]}
      `}
    >
      <span className="icon-wrap flex-shrink-0 mt-0.5 p-1 rounded-lg">
        {ICONS[alert.type]}
      </span>
      <p className="flex-1 text-sm font-medium leading-snug pt-0.5">{alert.message}</p>
      <button
        type="button"
        onClick={() => dismissAlert(alert.id)}
        className="flex-shrink-0 mt-0.5 text-current opacity-40 hover:opacity-70 transition-opacity"
        aria-label="닫기"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
}

export function AlertToast() {
  const { alerts } = useAlertStore();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {alerts.map(alert => (
          <div key={alert.id} className="pointer-events-auto">
            <ToastItem alert={alert} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
