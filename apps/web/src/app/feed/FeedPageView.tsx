import { FeedArchive } from '@/widgets/feed/archive';

export function FeedPageView() {
  return (
    <div className="min-h-screen bg-surface-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-sans font-black tracking-tighter text-surface-900 mb-2">
            Feed
          </h1>
          <p className="text-sm text-surface-500 font-medium">
            일상, 개발, 그리고 생각의 조각들
          </p>
        </div>

        <FeedArchive />
      </div>
    </div>
  );
}
