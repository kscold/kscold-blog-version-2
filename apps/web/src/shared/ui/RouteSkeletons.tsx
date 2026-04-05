import { Skeleton } from './Skeleton';

function SurfaceCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-[2rem] border border-surface-200 bg-white shadow-sm ${className}`.trim()}>
      {children}
    </div>
  );
}

function SkeletonTextGroup({
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

function SkeletonArticleCard() {
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

function SkeletonFeedCard() {
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

function SkeletonCommentCards({ count = 3 }: { count?: number }) {
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
