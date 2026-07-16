'use client';

import { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import type { MentionableUser } from '@/shared/model/types/social';

interface CommentComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isPending: boolean;
  currentUserName: string;
  currentUsername?: string;
  mentionable: MentionableUser[];
}

/** @언급 자동완성이 되는 댓글 입력창. @ 입력 또는 버튼으로 사용자를 언급할 수 있다. */
export function CommentComposer({
  value,
  onChange,
  onSubmit,
  isPending,
  currentUserName,
  currentUsername,
  mentionable,
}: CommentComposerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState<string | null>(null); // null = 드롭다운 닫힘
  const [anchor, setAnchor] = useState(0); // @ 위치
  const [activeIndex, setActiveIndex] = useState(0);

  // 본인은 언급 목록에서 제외
  const candidates = useMemo(
    () => mentionable.filter(u => !currentUsername || u.username !== currentUsername),
    [mentionable, currentUsername]
  );

  const suggestions = useMemo(() => {
    if (query === null) return [];
    const q = query.toLowerCase();
    return candidates
      .filter(
        u =>
          q === '' ||
          u.displayName.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [candidates, query]);

  const isOpen = query !== null && suggestions.length > 0;

  /** 입력 변화 시 커서 앞의 @토큰을 찾아 드롭다운 상태를 갱신 */
  const syncMentionState = (text: string, caret: number) => {
    // 커서 바로 앞에서 뒤로 가며 @ 를 찾는다(공백 만나면 중단)
    let at = -1;
    for (let i = caret - 1; i >= 0; i -= 1) {
      const ch = text[i];
      if (ch === '@') {
        const before = i > 0 ? text[i - 1] : ' ';
        if (before === ' ' || before === '\n' || i === 0) at = i;
        break;
      }
      if (ch === ' ' || ch === '\n') break;
    }
    if (at >= 0) {
      setAnchor(at);
      setQuery(text.slice(at + 1, caret));
      setActiveIndex(0);
    } else {
      setQuery(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    onChange(text);
    syncMentionState(text, e.target.selectionStart ?? text.length);
  };

  const pickMention = (user: MentionableUser) => {
    const caret = inputRef.current?.selectionStart ?? value.length;
    const before = value.slice(0, anchor);
    const after = value.slice(caret);
    const insert = `@${user.displayName} `;
    const next = before + insert + after;
    onChange(next);
    setQuery(null);
    // 삽입 위치로 커서 이동
    const nextCaret = before.length + insert.length;
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(nextCaret, nextCaret);
      }
    });
  };

  /** @ 버튼: 커서 위치에 @ 삽입 후 드롭다운 오픈 */
  const insertAtSign = () => {
    const el = inputRef.current;
    const caret = el?.selectionStart ?? value.length;
    const before = value.slice(0, caret);
    const after = value.slice(caret);
    const needsSpace = before.length > 0 && !/\s$/.test(before);
    const prefix = needsSpace ? ' @' : '@';
    const next = before + prefix + after;
    onChange(next);
    const nextCaret = before.length + prefix.length;
    requestAnimationFrame(() => {
      if (el) {
        el.focus();
        el.setSelectionRange(nextCaret, nextCaret);
      }
      syncMentionState(next, nextCaret);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(i => (i + 1) % suggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(i => (i - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        pickMention(suggestions[activeIndex]);
        return;
      }
      if (e.key === 'Escape') {
        setQuery(null);
        return;
      }
    }
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div>
      <p className="mb-2 text-xs text-surface-500">
        <span className="font-semibold text-surface-700">{currentUserName}</span> 계정으로 댓글을
        남깁니다.
      </p>
      <div className="relative flex gap-2">
        {/* 멘션 드롭다운 (입력창 위로 뜸) */}
        {isOpen && (
          <ul className="absolute bottom-full left-0 z-20 mb-1 w-64 max-w-[80vw] overflow-hidden rounded-xl border border-surface-200 bg-white py-1 shadow-lg">
            {suggestions.map((user, idx) => (
              <li key={user.username}>
                <button
                  type="button"
                  onMouseDown={e => {
                    e.preventDefault();
                    pickMention(user);
                  }}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left transition-colors ${
                    idx === activeIndex ? 'bg-primary-50' : 'hover:bg-surface-50'
                  }`}
                >
                  <MentionAvatar user={user} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-surface-900">
                      {user.displayName}
                      {user.isAdmin && (
                        <span className="ml-1 rounded bg-surface-900 px-1 py-0.5 text-[9px] font-bold text-white">
                          주인
                        </span>
                      )}
                    </span>
                    <span className="block truncate text-xs text-surface-400">
                      @{user.username}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={insertAtSign}
          title="사용자 언급"
          className="shrink-0 rounded-lg border border-surface-200 px-3 py-2 text-sm font-bold text-surface-500 transition-colors hover:border-surface-400 hover:text-surface-900"
        >
          @
        </button>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={() => setQuery(null)}
          placeholder="댓글을 입력하세요... (@로 언급)"
          maxLength={500}
          className="min-w-0 flex-1 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-surface-400"
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={isPending || !value.trim()}
          className="shrink-0 rounded-lg bg-surface-900 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-surface-800 disabled:opacity-50"
        >
          {isPending ? '...' : '게시'}
        </button>
      </div>
    </div>
  );
}

function MentionAvatar({ user }: { user: MentionableUser }) {
  if (user.avatar) {
    return (
      <Image
        src={user.avatar}
        alt={user.displayName}
        width={28}
        height={28}
        className="h-7 w-7 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
      {user.displayName.charAt(0)}
    </span>
  );
}
