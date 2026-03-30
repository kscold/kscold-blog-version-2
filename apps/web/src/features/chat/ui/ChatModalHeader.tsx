'use client';

interface Props {
  isConnected: boolean;
  onClose: () => void;
}

export function ChatModalHeader({ isConnected, onClose }: Props) {
  return (
    <div className="border-b border-surface-200 bg-surface-50 p-4 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-900 shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-surface-900">블로그 주인과 대화</h3>
            <div className="mt-0.5 flex items-center gap-1.5">
              <div className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-surface-300'}`} />
              <span className="text-xs font-medium text-surface-500">
                {isConnected ? '실시간 연결됨' : '오프라인 전송 모드'}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 transition-colors hover:bg-surface-200 hover:text-surface-900"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
