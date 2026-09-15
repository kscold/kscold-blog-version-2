import Link from 'next/link';
import { fetchPublicApi } from '@/shared/lib/seo/fetch';

interface NavigationEntry {
  title: string;
  slug: string;
  categorySlug: string;
}

interface NavigationData {
  previous: NavigationEntry | null;
  next: NavigationEntry | null;
}

export async function PostNavigation({ slug }: { slug: string }) {
  let navigation: NavigationData | null;
  try {
    navigation = await fetchPublicApi<NavigationData>(
      `/posts/slug/${encodeURIComponent(slug)}/navigation`, 300
    );
  } catch {
    // 보조 탐색 API 장애가 이미 읽을 수 있는 본문까지 가리지 않게 한다.
    return null;
  }
  if (!navigation?.previous && !navigation?.next) return null;
  return (
    <nav aria-label="게시글 간 이동" className="my-8 grid gap-3 sm:grid-cols-2">
      <NavigationLink entry={navigation.previous} direction="previous" />
      <NavigationLink entry={navigation.next} direction="next" />
    </nav>
  );
}

function NavigationLink({ entry, direction }: {
  entry: NavigationEntry | null;
  direction: 'previous' | 'next';
}) {
  if (!entry) return <div className="hidden sm:block" aria-hidden="true" />;
  const isPrevious = direction === 'previous';
  return (
    <Link href={`/blog/${encodeURIComponent(entry.categorySlug)}/${encodeURIComponent(entry.slug)}`}
      prefetch={false} rel={isPrevious ? 'prev' : 'next'}
      className={`min-w-0 rounded-2xl border border-surface-200 bg-white p-5 hover:border-surface-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-surface-900 ${isPrevious ? '' : 'text-right'}`}>
      <span className="block text-sm text-surface-500">{isPrevious ? '이전글 · 더 오래된 글' : '다음글 · 더 최근 글'}</span>
      <span className="mt-2 block break-words font-bold text-surface-900">{entry.title}</span>
    </Link>
  );
}
