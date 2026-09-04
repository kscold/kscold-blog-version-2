import type { Post } from '@/shared/model/types/blog';
import { fetchAllPublicApiPages } from '@/shared/lib/seo';
import { buildRssDocument } from '@/shared/lib/seo/rss';

export async function GET() {
  try {
    const posts = await fetchAllPublicApiPages<Post>('/posts');
    if (!posts) {
      return unavailableResponse();
    }

    return new Response(buildRssDocument(posts), {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch {
    return unavailableResponse();
  }
}

function unavailableResponse() {
    return new Response('RSS feed unavailable', {
      status: 503,
      headers: {
        'Cache-Control': 'no-store',
        'Retry-After': '300',
      },
    });
}
