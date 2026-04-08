import { Skeleton } from '../Skeleton';
import { SurfaceCard } from './base';

export function AdminPageSkeleton() {
  return (
    <div className="min-h-screen bg-surface-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-3">
          <Skeleton className="h-12 w-44" />
          <Skeleton className="h-4 w-24" />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <SurfaceCard key={index} className="px-4 py-4">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="mt-3 h-4 w-20" />
            </SurfaceCard>
          ))}
        </div>

        <div className="mt-10">
          <Skeleton className="h-6 w-24" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full rounded-xl bg-surface-900/90" />
            ))}
          </div>
        </div>

        <div className="mt-10">
          <Skeleton className="h-6 w-28" />
          <SurfaceCard className="mt-4 overflow-hidden">
            <div className="divide-y divide-surface-100">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="space-y-3 px-5 py-4">
                  <Skeleton className="h-4 w-3/5" />
                  <div className="flex gap-3">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </SurfaceCard>
        </div>

        <div className="mt-10">
          <Skeleton className="h-6 w-24" />
          <SurfaceCard className="mt-4 px-5 py-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-44 w-full" />
              <Skeleton className="h-44 w-full" />
            </div>
          </SurfaceCard>
        </div>
      </div>
    </div>
  );
}

export function AdminEditorSkeleton() {
  return (
    <div className="min-h-screen bg-surface-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-10 w-56" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-11 w-24 rounded-xl" />
            <Skeleton className="h-11 w-32 rounded-xl" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <SurfaceCard className="p-6">
            <Skeleton className="h-12 w-full rounded-xl" />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <Skeleton className="mt-5 h-72 w-full rounded-[2rem]" />
          </SurfaceCard>

          <div className="space-y-6">
            <SurfaceCard className="p-5">
              <Skeleton className="h-5 w-28" />
              <div className="mt-4 space-y-3">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </SurfaceCard>
            <SurfaceCard className="p-5">
              <Skeleton className="h-5 w-24" />
              <div className="mt-4 space-y-3">
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </SurfaceCard>
          </div>
        </div>
      </div>
    </div>
  );
}
