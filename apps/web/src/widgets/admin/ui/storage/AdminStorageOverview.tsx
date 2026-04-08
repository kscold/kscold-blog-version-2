interface BreadcrumbItem {
  label: string;
  prefix: string;
}

interface AdminStorageOverviewProps {
  breadcrumbs: BreadcrumbItem[];
  currentPrefix: string;
  folderCount: number;
  objectCount: number;
  errorMessage: string | null;
  onNavigate: (prefix: string) => void;
}

export function AdminStorageOverview({
  breadcrumbs,
  currentPrefix,
  folderCount,
  objectCount,
  errorMessage,
  onNavigate,
}: AdminStorageOverviewProps) {
  return (
    <section className="mb-6 rounded-2xl border border-surface-200 bg-white p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-surface-900">현재 경로</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            {breadcrumbs.map(item => (
              <button
                key={item.prefix || 'root'}
                type="button"
                onClick={() => onNavigate(item.prefix)}
                className="rounded-full border border-surface-200 bg-surface-50 px-3 py-1.5 font-medium text-surface-600 hover:border-surface-300 hover:text-surface-900"
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="text-sm leading-6 text-surface-500 [overflow-wrap:anywhere]">
            prefix: <span className="font-mono text-surface-600">{currentPrefix || '/'}</span>
          </p>
        </div>

        <div className="grid min-w-[240px] grid-cols-2 gap-3">
          <div className="rounded-xl border border-surface-100 bg-surface-50 px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-surface-400">
              폴더
            </div>
            <div className="mt-2 text-2xl font-black text-surface-900">{folderCount}</div>
          </div>
          <div className="rounded-xl border border-surface-100 bg-surface-50 px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-surface-400">
              파일
            </div>
            <div className="mt-2 text-2xl font-black text-surface-900">{objectCount}</div>
          </div>
        </div>
      </div>

      {errorMessage ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}
    </section>
  );
}
