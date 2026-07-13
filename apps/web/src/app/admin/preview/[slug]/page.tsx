import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { PostDetail } from '@/widgets/post';
import type { Post } from '@/shared/model/types/blog';

export const dynamic = 'force-dynamic';

async function getPostDirect(slug: string, authToken: string | undefined): Promise<Post | null> {
  try {
    const res = await fetch(`http://localhost:8080/api/posts/slug/${slug}`, {
      headers: authToken ? { Cookie: `auth-token=${authToken}` } : {},
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const payload = await res.json();
    return (payload?.data ?? null) as Post | null;
  } catch {
    return null;
  }
}

export default async function AdminPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token')?.value;
  const post = await getPostDirect(slug, authToken);

  if (!post) {
    notFound();
  }

  return <PostDetail post={post} />;
}
