import type { ReactNode } from 'react';

interface DemoFrameProps {
  title: string;
  description: string;
  children: ReactNode;
}

// 글 사이에 들어가는 데모의 공통 틀. 본문 목차에 섞이지 않도록 제목은 heading 대신 문단으로 둔다.
export function DemoFrame({ title, description, children }: DemoFrameProps) {
  return (
    <section
      aria-label={title}
      className="rounded-2xl border border-surface-200 bg-white p-5 shadow-xs sm:p-6 dark:border-surface-800 dark:bg-surface-900"
    >
      <p className="text-xs font-semibold tracking-[0.18em] text-primary-600 dark:text-primary-300">직접 해 보기</p>
      <p className="mt-1.5 text-lg font-bold text-surface-900 dark:text-white">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-surface-600 dark:text-surface-300">{description}</p>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

interface ChoiceOption<T extends string | number> {
  value: T;
  label: string;
  isCode?: boolean;
}

interface ChoiceGroupProps<T extends string | number> {
  label: string;
  options: ChoiceOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

// 여러 값 중 하나를 고르는 버튼 묶음. 고른 버튼은 aria-pressed로 알린다.
export function ChoiceGroup<T extends string | number>({ label, options, value, onChange }: ChoiceGroupProps<T>) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map(option => {
        const isSelected = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(option.value)}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
              option.isCode ? 'text-left font-mono text-[13px]' : 'font-medium'
            } ${
              isSelected
                ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-500/15 dark:text-primary-200'
                : 'border-surface-200 bg-white text-surface-600 hover:border-surface-300 hover:text-surface-900 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-300 dark:hover:border-surface-600 dark:hover:text-white'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
