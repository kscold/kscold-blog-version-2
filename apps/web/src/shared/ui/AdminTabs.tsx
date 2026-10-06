'use client';

interface AdminTab<Key extends string> {
  key: Key;
  label: string;
  /** 탭 이름 옆에 붙는 건수 등 짧은 보조 표시 */
  badge?: string | number;
}

interface AdminTabsProps<Key extends string> {
  tabs: ReadonlyArray<AdminTab<Key>>;
  active: Key;
  onChange: (key: Key) => void;
  label: string;
}

/** 한 화면에 성격이 다른 작업이 길게 쌓일 때, 자주 쓰는 것부터 나눠 보여주는 탭. */
export function AdminTabs<Key extends string>({
  tabs,
  active,
  onChange,
  label,
}: AdminTabsProps<Key>) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex flex-wrap gap-1 rounded-2xl border border-surface-200 bg-white p-1"
    >
      {tabs.map(tab => {
        const selected = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.key)}
            className={`flex-1 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
              selected
                ? 'bg-surface-900 text-white'
                : 'text-surface-500 hover:bg-surface-50 hover:text-surface-900'
            }`}
          >
            {tab.label}
            {tab.badge !== undefined && (
              <span
                className={`ml-1.5 text-xs ${selected ? 'text-surface-300' : 'text-surface-400'}`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
