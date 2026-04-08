import { Skeleton } from '@/shared/ui/Skeleton';

export function TagManagementSkeleton() {
  return (
    <>
      <div className="space-y-3 sm:hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-3 w-32 rounded-md" />
              </div>
              <Skeleton className="h-7 w-20 rounded-full" />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <Skeleton className="h-3 w-20 rounded-md" />
              <div className="flex gap-3">
                <Skeleton className="h-4 w-8 rounded-md" />
                <Skeleton className="h-4 w-8 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 sm:block">
        <div className="space-y-4 px-4 py-4">
          <div className="grid grid-cols-[1.2fr_1.2fr_0.6fr_0.8fr_0.8fr] gap-4">
            <Skeleton className="h-4 w-16 rounded-md" />
            <Skeleton className="h-4 w-16 rounded-md" />
            <Skeleton className="h-4 w-14 rounded-md" />
            <Skeleton className="h-4 w-14 rounded-md" />
            <Skeleton className="h-4 w-14 rounded-md justify-self-end" />
          </div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-[1.2fr_1.2fr_0.6fr_0.8fr_0.8fr] gap-4 border-t border-gray-100 pt-4 dark:border-gray-800"
            >
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-4 w-10 rounded-md" />
              <Skeleton className="h-4 w-20 rounded-md" />
              <div className="flex justify-end gap-2">
                <Skeleton className="h-4 w-8 rounded-md" />
                <Skeleton className="h-4 w-8 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
