'use client';

import { useState, useRef, KeyboardEvent } from 'react';

const PRESET_STACKS = [
  'Java', 'TypeScript', 'JavaScript', 'Python', 'Kotlin', 'Go', 'Rust', 'C++', 'HTML', 'CSS',
  'Spring Boot', 'NestJS', 'Express', 'FastAPI', 'Django',
  'React', 'Next.js', 'Vue.js', 'Svelte', 'Angular',
  'Tailwind CSS', 'SCSS', 'Styled-Components',
  'JPA/Hibernate', 'TypeORM', 'Prisma', 'Mongoose',
  'PostgreSQL', 'MySQL', 'MariaDB', 'MongoDB', 'Redis', 'SQLite',
  'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Git', 'GitHub Actions', 'CI/CD',
  'Figma', 'GraphQL', 'REST API', 'WebSocket', 'gRPC',
];

interface TechStackSelectorProps {
  value: string[];
  sharedStacks?: string[];
  onChange: (next: string[]) => void;
}

export function TechStackSelector({ value, sharedStacks = [], onChange }: TechStackSelectorProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const allOptions = Array.from(new Set([...PRESET_STACKS, ...sharedStacks])).sort();
  const filtered = input.trim()
    ? allOptions.filter(s => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s))
    : allOptions.filter(s => !value.includes(s));
  const showCreate = input.trim() && !allOptions.some(s => s.toLowerCase() === input.toLowerCase()) && !value.includes(input.trim());

  const toggle = (tag: string) => {
    onChange(value.includes(tag) ? value.filter(t => t !== tag) : [...value, tag]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      const tag = input.trim();
      if (!value.includes(tag)) onChange([...value, tag]);
      setInput('');
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="space-y-3">
      {/* 선택된 태그 */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface-900 text-white text-xs font-medium rounded-full"
            >
              {tag}
              <button
                type="button"
                onClick={() => toggle(tag)}
                className="ml-0.5 opacity-70 hover:opacity-100 transition-opacity"
                aria-label={`${tag} 제거`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 입력창 */}
      <div className="flex items-center gap-2 rounded-xl border border-surface-200 px-3 py-2 focus-within:border-surface-400 transition-colors bg-white">
        <svg className="w-4 h-4 text-surface-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
        </svg>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="기술 검색 또는 직접 입력 후 Enter"
          className="flex-1 text-sm outline-none placeholder:text-surface-400 bg-transparent"
        />
      </div>

      {/* 드롭다운 */}
      {(filtered.length > 0 || showCreate) && (
        <div className="rounded-xl border border-surface-200 bg-white shadow-sm overflow-hidden max-h-48 overflow-y-auto">
          {showCreate && (
            <button
              type="button"
              onClick={() => { toggle(input.trim()); setInput(''); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-surface-50 transition-colors border-b border-surface-100"
            >
              <span className="text-surface-400 text-xs">추가</span>
              <span className="font-medium text-surface-900">"{input.trim()}"</span>
              <span className="ml-auto text-[10px] text-surface-400">Enter</span>
            </button>
          )}
          {filtered.slice(0, 20).map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => { toggle(tag); setInput(''); }}
              className="w-full text-left px-3 py-2 text-sm text-surface-700 hover:bg-surface-50 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* 빠른 선택 프리셋 (입력 없을 때) */}
      {!input && value.length === 0 && (
        <div>
          <p className="text-xs text-surface-400 mb-2">자주 쓰는 기술</p>
          <div className="flex flex-wrap gap-1.5">
            {['TypeScript', 'React', 'Next.js', 'Java', 'Spring Boot', 'Docker', 'Python', 'Go'].map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => toggle(tag)}
                className="px-2.5 py-1 text-xs font-medium border border-surface-200 text-surface-600 rounded-full hover:border-surface-900 hover:text-surface-900 transition-colors"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
