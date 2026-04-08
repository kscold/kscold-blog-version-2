import { Skeleton } from '../Skeleton';
import {
  SkeletonCommentCards,
  SkeletonTextGroup,
  SurfaceCard,
} from './base';

export function GuestbookPageSkeleton() {
  return (
    <div className="min-h-screen bg-surface-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <SurfaceCard className="px-6 py-7 sm:px-8">
            <Skeleton className="h-3 w-28 rounded-full" />
            <Skeleton className="mt-4 h-12 w-3/4 sm:h-14" />
            <SkeletonTextGroup className="mt-5" widths={['w-full', 'w-5/6', 'w-2/3']} />
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-surface-200 bg-surface-50 px-4 py-4">
                  <Skeleton className="h-3 w-16 rounded-full" />
                  <Skeleton className="mt-3 h-7 w-20" />
                  <Skeleton className="mt-2 h-4 w-24" />
                </div>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-5 sm:p-6">
            <div className="rounded-[1.5rem] bg-surface-900 px-5 py-5 sm:px-6">
              <Skeleton className="h-3 w-24 rounded-full bg-white/10" />
              <SkeletonTextGroup
                className="mt-5"
                widths={['w-4/5 bg-white/10', 'w-2/3 bg-white/10']}
              />
              <Skeleton className="mt-5 h-40 w-full rounded-[1.5rem] bg-white/10" />
              <div className="mt-4 flex justify-between gap-3">
                <Skeleton className="h-4 w-16 bg-white/10" />
                <Skeleton className="h-10 w-28 rounded-full bg-white/10" />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <SkeletonCommentCards count={4} />
            </div>
          </SurfaceCard>
        </div>
      </div>
    </div>
  );
}

export function InfoPageSkeleton() {
  return (
    <div className="min-h-screen bg-surface-50">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <Skeleton className="mx-auto h-28 w-28 rounded-full" />
          <Skeleton className="mx-auto mt-6 h-12 w-48" />
          <Skeleton className="mx-auto mt-3 h-4 w-24" />
          <Skeleton className="mx-auto mt-4 h-5 w-60" />
        </div>

        <div className="space-y-14">
          <section>
            <Skeleton className="h-3 w-16 rounded-full" />
            <SkeletonTextGroup className="mt-6" widths={['w-full', 'w-full', 'w-5/6']} />
          </section>

          <section>
            <Skeleton className="h-3 w-20 rounded-full" />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          </section>

          <section>
            <Skeleton className="h-3 w-20 rounded-full" />
            <div className="mt-6 space-y-3">
              <SurfaceCard className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-24 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              </SurfaceCard>
            </div>
          </section>

          <div className="text-center">
            <Skeleton className="mx-auto h-12 w-40 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoginPageSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 px-4 py-12">
      <SurfaceCard className="w-full max-w-md p-6 sm:p-8">
        <div className="space-y-3 text-center">
          <Skeleton className="mx-auto h-8 w-32" />
          <Skeleton className="mx-auto h-4 w-44" />
        </div>

        <div className="mt-8 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <Skeleton className="mt-2 h-12 w-full rounded-xl" />
        </div>
      </SurfaceCard>
    </div>
  );
}
