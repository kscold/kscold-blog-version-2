import { BlogArchive } from '@/widgets/blog';

export function BlogPageView() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-sans font-black tracking-tighter text-surface-900 mb-6">
            Archive.
          </h1>
          <p className="text-lg text-surface-500 font-medium">
            개발자 김승찬의 기술 블로그입니다. 개발하면서 배우고 느낀 것들을 기록합니다.
          </p>
        </div>

        <BlogArchive />
      </div>
    </div>
  );
}
