'use client';

interface Props {
  value: string;
  placeholder: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
}

export function ChatComposer({ value, placeholder, disabled, onChange, onSubmit }: Props) {
  return (
    <div
      className="border-t border-surface-200 bg-white flex-shrink-0 p-4"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
    >
      <form onSubmit={onSubmit} className="flex gap-2.5">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="flex-1 rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm font-medium text-surface-900 placeholder:text-surface-400 transition-all focus:border-surface-900 focus:outline-none focus:ring-1 focus:ring-surface-900"
        />
        <button
          type="submit"
          disabled={disabled}
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-surface-900 text-white transition-all hover:bg-surface-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
}
