import { ADMIN_NIGHT_PROCESS_DESCRIPTION, ADMIN_NIGHT_PROCESS_TITLE, ADMIN_NIGHT_STEPS } from '@/widgets/admin-night/lib/adminNight';

export function AdminNightProcessSection() {
  return (
    <section className="rounded-[28px] border border-surface-200 bg-white p-6 sm:p-7">
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-surface-400">Core Concept</p>
        <h2 className="text-2xl font-black tracking-tight text-surface-900">{ADMIN_NIGHT_PROCESS_TITLE}</h2>
        <p className="max-w-2xl break-keep text-sm leading-8 text-surface-500 sm:text-[15px]">
          {ADMIN_NIGHT_PROCESS_DESCRIPTION}
        </p>
      </div>

      <div className="mt-6 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        {ADMIN_NIGHT_STEPS.map((step, index) => (
          <article key={step.id} className="rounded-[24px] border border-surface-200 bg-surface-50 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-surface-900 px-2 text-xs font-black text-white">
                {index + 1}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-surface-400">
                Step {index + 1}
              </span>
            </div>
            <div className="mt-4 space-y-2">
              <h3 className="break-keep text-lg font-black leading-7 tracking-tight text-surface-900">{step.title}</h3>
              <p className="break-keep text-sm leading-7 text-surface-500">{step.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
