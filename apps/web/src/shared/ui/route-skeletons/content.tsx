import { Skeleton } from '../Skeleton';
import {
  SkeletonArticleCard,
  SkeletonCommentCards,
  SkeletonFeedCard,
  SkeletonTextGroup,
  SurfaceCard,
} from './base';

export function HomePageSkeleton() {
  return (
    <main className="min-h-screen bg-surface-50 text-surface-900">
      <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-10 text-center">
          <Skeleton className="h-10 w-64 rounded-full" />
          <Skeleton className="h-28 w-[min(70vw,640px)] rounded-[2.5rem] sm:h-36" />
          <Skeleton className="h-px w-24 rounded-none" />
          <div className="space-y-4">
            <Skeleton className="mx-auto h-8 w-[min(80vw,560px)]" />
            <Skeleton className="mx-auto h-8 w-[min(72vw,460px)]" />
            <Skeleton className="mx-auto h-8 w-[min(76vw,500px)]" />
          </div>
          <div className="flex w-full max-w-lg flex-col gap-4 sm:flex-row">
            <Skeleton className="h-14 flex-1 rounded-2xl" />
            <Skeleton className="h-14 flex-1 rounded-2xl" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonArticleCard key={index} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SurfaceCard key={index} className="px-5 py-6">
              <Skeleton className="h-3 w-20 rounded-full" />
              <Skeleton className="mt-6 h-10 w-16" />
              <Skeleton className="mt-3 h-4 w-24" />
            </SurfaceCard>
          ))}
        </div>
      </section>
    </main>
  );
}

export function ArchivePageSkeleton() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <Skeleton className="mx-auto h-14 w-64 sm:h-16 sm:w-80" />
          <Skeleton className="mx-auto mt-6 h-5 w-72 sm:w-96" />
        </div>

        <div className="mb-10 flex flex-wrap justify-center gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-24 rounded-full" />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonArticleCard key={index} />
          ))}
        </div>

        <div className="mt-12 flex items-center justify-center gap-3">
          <Skeleton className="h-11 w-11 rounded-xl" />
          <Skeleton className="h-11 w-11 rounded-xl" />
          <Skeleton className="h-11 w-11 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function PostPageSkeleton() {
  return (
    <div className="min-h-screen bg-surface-50">
      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-5">
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-9 w-28 rounded-full" />
            <Skeleton className="h-9 w-24 rounded-full" />
          </div>
          <Skeleton className="h-14 w-5/6 sm:h-16" />
          <SkeletonTextGroup widths={['w-full', 'w-5/6', 'w-2/3']} />
          <div className="flex flex-wrap gap-6 pt-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="aspect-[16/9] w-full rounded-[2rem]" />
        </div>

        <div className="mt-12 space-y-4">
          <SkeletonTextGroup widths={['w-full', 'w-full', 'w-11/12', 'w-10/12', 'w-9/12']} />
          <Skeleton className="h-52 w-full rounded-[2rem]" />
          <SkeletonTextGroup widths={['w-full', 'w-full', 'w-full', 'w-5/6']} />
        </div>

        <div className="mt-16 space-y-4">
          <Skeleton className="h-7 w-32" />
          <SkeletonCommentCards />
        </div>
      </article>
    </div>
  );
}

export function FeedPageSkeleton() {
  return (
    <div className="min-h-screen bg-surface-50">
      <div className="mx-auto max-w-xl px-4 py-8">
        <div className="mb-8 text-center">
          <Skeleton className="mx-auto h-12 w-40" />
          <Skeleton className="mx-auto mt-4 h-4 w-56" />
        </div>

        <SurfaceCard className="mb-6 px-5 py-5">
          <div className="flex items-start gap-3">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-24 w-full rounded-3xl" />
              <div className="flex justify-between">
                <Skeleton className="h-10 w-24 rounded-full" />
                <Skeleton className="h-10 w-28 rounded-full" />
              </div>
            </div>
          </div>
        </SurfaceCard>

        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonFeedCard key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function FeedDetailPageSkeleton() {
  return (
    <div className="min-h-screen bg-surface-50">
      <div className="mx-auto max-w-xl px-4 py-8">
        <Skeleton className="mb-6 h-5 w-28" />
        <SkeletonFeedCard />
        <SurfaceCard className="mt-4 px-4 py-5">
          <Skeleton className="h-5 w-24" />
          <div className="mt-5 space-y-3">
            <SkeletonCommentCards />
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}
