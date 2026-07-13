'use client';

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import type { SuggestionKeyDownProps } from '@tiptap/suggestion';
import type { CommandItem } from '@/features/editor/extensions/slashCommandItems';

/* ─────────────── 메뉴 뷰 (노션풍 팝오버) ─────────────── */

export interface SlashMenuHandle {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
}

export interface SlashMenuProps {
  items: CommandItem[];
  command: (item: CommandItem) => void;
}

export const SlashCommandList = forwardRef<SlashMenuHandle, SlashMenuProps>(function SlashCommandList(
  { items, command },
  ref
) {
  const [selected, setSelected] = useState(0);

  useEffect(() => setSelected(0), [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowDown') {
        setSelected(prev => (prev + 1) % Math.max(items.length, 1));
        return true;
      }
      if (event.key === 'ArrowUp') {
        setSelected(prev => (prev - 1 + items.length) % Math.max(items.length, 1));
        return true;
      }
      if (event.key === 'Enter') {
        if (items[selected]) command(items[selected]);
        return true;
      }
      return false;
    },
  }));

  if (items.length === 0) {
    return (
      <div className="w-72 rounded-2xl border border-surface-200 bg-white p-3 text-sm text-surface-400 shadow-xl">
        일치하는 블록이 없습니다
      </div>
    );
  }

  return (
    <div className="slash-menu w-72 max-h-80 overflow-y-auto overscroll-contain rounded-2xl border border-surface-200 bg-white p-1.5 shadow-xl">
      <p className="px-2.5 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-surface-400">
        블록
      </p>
      {items.map((item, index) => (
        <button
          key={item.title}
          type="button"
          onClick={() => command(item)}
          onMouseEnter={() => setSelected(index)}
          className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors ${
            index === selected ? 'bg-surface-100' : 'bg-transparent'
          }`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-surface-200 bg-surface-50 text-surface-600">
            {item.glyph}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-surface-900">{item.title}</span>
            <span className="block truncate text-xs text-surface-400">{item.description}</span>
          </span>
        </button>
      ))}
    </div>
  );
});
