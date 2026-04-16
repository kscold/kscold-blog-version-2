import type { ReactNode } from 'react';

interface AdminNightStatusSectionProps {
  title: string;
  description: string;
  countLabel?: string;
  children: ReactNode;
}

export function AdminNightStatusSection({
  title,
  description,
  countLabel,
  children,
}: AdminNightStatusSectionProps) {
  return (
    <section className="rounded-[28px] border border-surface-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-surface-900">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-surface-500">{description}</p>
        </div>
        {countLabel && (
          <span className="rounded-full border border-surface-200 bg-surface-50 px-3 py-1 text-xs font-bold text-surface-600">
            {countLabel}
          </span>
        )}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}
