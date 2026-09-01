export type ChatMode = 'agent' | 'feed' | 'owner';

interface ChatModeTabsProps {
  mode: ChatMode;
  onChange: (mode: ChatMode) => void;
}

const chatModes: Array<{ id: ChatMode; label: string }> = [
  { id: 'agent', label: 'Agent에게 묻기' },
  { id: 'feed', label: '피드 초안' },
  { id: 'owner', label: '주인에게 남기기' },
];

export function ChatModeTabs({ mode, onChange }: ChatModeTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="대화 기능 선택"
      className="grid shrink-0 grid-cols-3 gap-2 border-b border-surface-200 bg-white px-3 py-2.5 sm:px-4 sm:py-3"
    >
      {chatModes.map(chatMode => (
        <button
          key={chatMode.id}
          type="button"
          role="tab"
          aria-selected={mode === chatMode.id}
          onClick={() => onChange(chatMode.id)}
          className={`min-w-0 rounded-xl px-2 py-2 text-[11px] font-black transition sm:px-3 sm:text-xs ${
            mode === chatMode.id
              ? 'bg-surface-900 text-white'
              : 'bg-surface-50 text-surface-500 hover:bg-surface-100 hover:text-surface-900'
          }`}
        >
          {chatMode.label}
        </button>
      ))}
    </div>
  );
}
