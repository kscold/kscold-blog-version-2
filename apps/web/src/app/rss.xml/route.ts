import { fetchAllPublicApiPages } from '@/shared/lib/seo';
import { buildRssDocument } from '@/shared/lib/seo/rss';
import { isPostSummary } from '@/widgets/blog/archive';

export async function GET() {
  try {
    const posts = await fetchAllPublicApiPages<unknown>('/posts');
    if (!posts || !posts.every(isPostSummary)) {
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
