'use client';

import { OWNER_CHAT_MESSAGE_MAX_LENGTH } from '@/features/chat';
import { ChatTextInput } from './ChatTextInput';

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
      className="flex-shrink-0 border-t border-surface-200 bg-white p-3 sm:p-4"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
    >
      <form onSubmit={onSubmit} className="flex min-w-0 gap-2.5">
        <ChatTextInput
          label="블로그 주인에게 보낼 메시지"
          maxLength={OWNER_CHAT_MESSAGE_MAX_LENGTH}
          value={value}
          onChange={onChange}
          canSubmit={!disabled}
          placeholder={placeholder}
        />
        <button
          type="submit"
          aria-label="블로그 주인에게 메시지 보내기"
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
