import type { ReactNode } from 'react';
import { Skeleton } from '../Skeleton';

export function SurfaceCard({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-[2rem] border border-surface-200 bg-white shadow-sm ${className}`.trim()}>
      {children}
    </div>
  );
}

export function SkeletonTextGroup({
  widths,
  className = '',
}: {
  widths: string[];
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`.trim()}>
      {widths.map((width, index) => (
        <Skeleton key={`${width}-${index}`} className={`h-4 ${width}`} />
      ))}
    </div>
  );
}

export function SkeletonArticleCard() {
  return (
    <SurfaceCard className="overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full rounded-none sm:aspect-[16/10]" />
      <div className="space-y-4 px-5 py-6">
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-8 w-4/5" />
        <SkeletonTextGroup widths={['w-full', 'w-5/6', 'w-3/5']} />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </div>
    </SurfaceCard>
  );
}

export function SkeletonFeedCard() {
  return (
    <SurfaceCard className="overflow-hidden">
      <div className="flex items-center gap-3 px-5 pt-5">
        <Skeleton className="h-11 w-11 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="space-y-3 px-5 py-4">
        <SkeletonTextGroup widths={['w-full', 'w-4/5', 'w-2/3']} />
      </div>
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="flex items-center gap-3 px-5 py-4">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-16" />
      </div>
    </SurfaceCard>
  );
}

export function SkeletonCommentCards({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <SurfaceCard key={index} className="px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-8 w-14 rounded-full" />
          </div>
          <SkeletonTextGroup className="mt-4" widths={['w-full', 'w-5/6']} />
        </SurfaceCard>
      ))}
    </div>
  );
}
