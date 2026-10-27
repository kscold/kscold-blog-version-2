import Link from 'next/link';

interface ChatAccessGateProps {
  onAgentClick: () => void;
  onClose: () => void;
}

export function ChatAccessGate({ onAgentClick, onClose }: ChatAccessGateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-surface-50 p-6">
      <div className="text-center">
        <p className="text-sm font-bold text-surface-900">주인에게 메시지를 남기려면 로그인이 필요해요</p>
        <p className="mt-1 text-xs leading-5 text-surface-400">로그인 없이 궁금한 내용은 Agent에게 바로 물어볼 수 있습니다.</p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onAgentClick}
          className="rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm font-semibold text-surface-700 transition hover:border-surface-900 hover:text-surface-900"
        >
          Agent로 묻기
        </button>
        <Link
          href="/login"
          onClick={onClose}
          className="rounded-xl bg-surface-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-surface-800"
        >
          로그인
        </Link>
      </div>
    </div>
  );
}
