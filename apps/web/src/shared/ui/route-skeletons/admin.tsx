import { Skeleton } from '../Skeleton';
import { SurfaceCard } from './base';

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
