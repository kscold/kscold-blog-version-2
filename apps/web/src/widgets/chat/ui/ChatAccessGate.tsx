import Link from 'next/link';

interface ChatAccessGateProps {
  mode: 'feed' | 'owner';
  onAgentClick: () => void;
  onClose: () => void;
}

const accessCopy = {
  feed: {
    title: '피드 초안 기능은 로그인 후 사용할 수 있어요',
    description: '내 기록을 참고한 초안은 작성자 확인 후에만 피드에 적용됩니다.',
  },
  owner: {
    title: '주인에게 메시지를 남기려면 로그인이 필요해요',
    description: '로그인 없이 궁금한 내용은 Agent에게 바로 물어볼 수 있습니다.',
  },
};

export function ChatAccessGate({ mode, onAgentClick, onClose }: ChatAccessGateProps) {
  const copy = accessCopy[mode];

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-surface-50 p-6">
      <div className="text-center">
        <p className="text-sm font-bold text-surface-900">{copy.title}</p>
        <p className="mt-1 text-xs leading-5 text-surface-400">{copy.description}</p>
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
