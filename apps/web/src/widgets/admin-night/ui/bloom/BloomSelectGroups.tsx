'use client';

import { type AdminNightOption } from '@/widgets/admin-night/lib/adminNight';

export function OptionButtonGroup({
  title,
  options,
  value,
  onChange,
  error,
  required = false,
}: {
  title: string;
  options: AdminNightOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-bold text-surface-900">
        {title} {required && <span className="text-cyan-600">*</span>}
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map(option => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
              value === option.value
                ? 'border-surface-900 bg-surface-900 text-white'
                : error
                  ? 'border-rose-200 bg-rose-50 text-surface-900 hover:border-rose-300'
                  : 'border-surface-200 bg-surface-50 text-surface-900 hover:border-surface-300'
            }`}
          >
            <p className="text-sm font-black">{option.label}</p>
            <p className="mt-1 text-xs leading-5 opacity-75">{option.description}</p>
          </button>
        ))}
      </div>
      {error && <p className="text-xs font-bold text-rose-500">{error}</p>}
    </div>
  );
}

export function MultiSelectGrid({
  title,
  options,
  values,
  onToggle,
  error,
  required = false,
}: {
  title: string;
  options: AdminNightOption[];
  values: string[];
  onToggle: (value: string) => void;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-bold text-surface-900">
        {title} {required && <span className="text-cyan-600">*</span>}
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map(option => {
          const selected = values.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onToggle(option.value)}
              aria-pressed={selected}
              className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                selected
                  ? 'border-cyan-500 bg-cyan-50 text-surface-900'
                  : error
                    ? 'border-rose-200 bg-rose-50 text-surface-900 hover:border-rose-300'
                    : 'border-surface-200 bg-surface-50 text-surface-900 hover:border-surface-300'
              }`}
            >
              <p className="text-sm font-black">{option.label}</p>
              <p className="mt-1 text-xs leading-5 text-surface-500">{option.description}</p>
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs font-bold text-rose-500">{error}</p>}
    </div>
  );
}
