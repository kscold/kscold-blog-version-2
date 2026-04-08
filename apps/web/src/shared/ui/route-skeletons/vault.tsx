import { Skeleton } from '../Skeleton';
import { SkeletonTextGroup, SurfaceCard } from './base';

export function VaultIndexPageSkeleton() {
  return (
    <div className="min-h-screen bg-surface-50 p-4 lg:p-6">
      <div className="flex h-[calc(100vh-2rem)] gap-4 lg:h-[calc(100vh-3rem)]">
        <SurfaceCard className="hidden w-80 shrink-0 p-6 lg:block">
          <Skeleton className="h-3 w-28 rounded-full" />
          <div className="mt-8 space-y-4">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/5" />
          </div>
        </SurfaceCard>

        <SurfaceCard className="relative flex-1 overflow-hidden">
          <div className="absolute left-6 top-6 hidden lg:block">
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
          <div className="flex h-full items-center justify-center">
            <div className="grid grid-cols-3 gap-6 opacity-80">
              {Array.from({ length: 9 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className={`rounded-full ${index % 3 === 0 ? 'h-14 w-14' : index % 2 === 0 ? 'h-20 w-20' : 'h-16 w-16'}`}
                />
              ))}
            </div>
          </div>
          <Skeleton className="absolute bottom-6 right-6 h-14 w-14 rounded-full lg:hidden" />
        </SurfaceCard>
      </div>
    </div>
  );
}

export function VaultNotePageSkeleton() {
  return (
    <div className="min-h-screen bg-surface-50 p-4 lg:p-6">
      <div className="flex h-[calc(100vh-2rem)] gap-4 lg:h-[calc(100vh-3rem)]">
        <SurfaceCard className="hidden w-80 shrink-0 p-6 lg:block">
          <Skeleton className="h-3 w-28 rounded-full" />
          <div className="mt-8 space-y-4">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </SurfaceCard>

        <SurfaceCard className="flex-1 overflow-hidden">
          <div className="h-full overflow-hidden px-4 py-6 sm:px-6 lg:px-12">
            <Skeleton className="h-10 w-28 rounded-full" />
            <div className="mx-auto mt-10 max-w-4xl space-y-5">
              <Skeleton className="h-14 w-3/4" />
              <Skeleton className="h-4 w-32" />
              <SkeletonTextGroup className="pt-4" widths={['w-full', 'w-full', 'w-5/6', 'w-4/6']} />
              <Skeleton className="h-44 w-full rounded-[2rem]" />
              <SkeletonTextGroup widths={['w-full', 'w-full', 'w-11/12']} />
              <div className="pt-6">
                <Skeleton className="h-5 w-24" />
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </div>
            </div>
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}

export function GraphPanelSkeleton() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-surface-200 bg-surface-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.18),_transparent_55%)]" />
      <div className="flex h-full items-center justify-center">
        <div className="grid grid-cols-3 gap-5 opacity-90">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton
              key={index}
              className={`rounded-full ${index % 2 === 0 ? 'h-16 w-16' : 'h-12 w-12'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
