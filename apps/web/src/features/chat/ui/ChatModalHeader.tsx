'use client';

interface Props {
  isConnected: boolean;
  title?: string;
  subtitle?: string;
  onClose: () => void;
}

export function ChatModalHeader({
  isConnected,
  title = '블로그 주인과 대화',
  subtitle,
  onClose,
}: Props) {
  return (
    <div className="flex-shrink-0 border-b border-surface-200 bg-surface-50 p-3 sm:p-4">
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-surface-900 shadow-sm sm:h-10 sm:w-10">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-surface-900">{title}</h3>
            <div className="mt-0.5 flex items-center gap-1.5">
              <div className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-surface-300'}`} />
              <span className="truncate text-xs font-medium text-surface-500">
                {subtitle || (isConnected ? '실시간 연결됨' : '오프라인 전송 모드')}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="채팅 닫기"
          className="ml-2 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-surface-400 transition-colors hover:bg-surface-200 hover:text-surface-900"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
