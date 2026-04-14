import { Skeleton } from '@/shared/ui/Skeleton';

export default function AdminNightLoading() {
  return (
    <main className="min-h-screen px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-[32px] border border-surface-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="space-y-4">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-14 w-full max-w-3xl rounded-3xl" />
            <Skeleton className="h-24 w-full max-w-4xl rounded-3xl" />
          </div>
        </div>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.95fr)]">
          <div className="rounded-[28px] border border-surface-200 bg-surface-50/80 p-5">
            <Skeleton className="h-10 w-60 rounded-2xl" />
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-7">
              {Array.from({ length: 7 }).map((_, index) => (
                <Skeleton key={index} className="h-40 rounded-3xl" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-72 rounded-[28px]" />
            <Skeleton className="h-72 rounded-[28px]" />
          </div>
        </div>
      </div>
    </main>
  );
}
