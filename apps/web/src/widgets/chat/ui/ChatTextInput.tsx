'use client';

import { useId, useLayoutEffect, useRef } from 'react';

interface Props {
  label: string;
  placeholder: string;
  value: string;
  maxLength: number;
  onChange: (value: string) => void;
  canSubmit: boolean;
}

export function ChatTextInput({ label, placeholder, value, maxLength, onChange, canSubmit }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const composing = useRef(false);
  const helpId = useId();
  useLayoutEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = '0px';
    ref.current.style.height = `${Math.min(ref.current.scrollHeight, 144)}px`;
  }, [value]);

  return (
    <div className="min-w-0 flex-1">
      <textarea
        ref={ref} rows={1} aria-label={label} aria-describedby={helpId}
        value={value} maxLength={maxLength} placeholder={placeholder} autoComplete="off"
        onChange={event => onChange(event.target.value)}
        onCompositionStart={() => { composing.current = true; }}
        onCompositionEnd={() => { composing.current = false; }}
        onKeyDown={event => {
          if (event.key !== 'Enter' || event.shiftKey || composing.current ||
              event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return;
          event.preventDefault();
          if (canSubmit) event.currentTarget.form?.requestSubmit();
        }}
        className="block min-h-12 w-full resize-none rounded-xl border border-surface-200 bg-surface-50 px-3 py-3 text-base leading-6 text-surface-900 placeholder:text-surface-400 focus:border-primary-600 focus:outline-hidden focus:ring-1 focus:ring-primary-600 sm:text-sm"
      />
      <p id={helpId} className="mt-1 text-[10px] leading-4 text-surface-500">
        <span className="hidden sm:inline">Enter 전송 · Shift+Enter 줄바꿈</span>
        {value.length >= maxLength * 0.8 && <span className="ml-2" aria-live="polite">{value.length}/{maxLength}</span>}
      </p>
    </div>
  );
}
