'use client';

interface Props {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
}

export function AdminChatComposer({ value, disabled, onChange, onSend }: Props) {
  return (
    <div className="flex gap-2 border-t border-surface-200 px-4 py-3">
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), onSend())}
        placeholder="메시지 입력..."
        className="flex-1 rounded-lg border border-surface-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-surface-300"
      />
      <button
        onClick={onSend}
        disabled={disabled}
        className="rounded-lg bg-surface-900 px-4 py-2 text-sm text-white transition-colors hover:bg-surface-800 disabled:opacity-40"
      >
        전송
      </button>
    </div>
  );
}
