import { notFound } from 'next/navigation';
import { PostDetail } from '@/widgets/post';
import type { Post } from '@/shared/model/types/blog';
import { fetchViewerApi } from '@/shared/lib/seo';

export const dynamic = 'force-dynamic';

async function getPostDirect(slug: string): Promise<Post | null> {
  return fetchViewerApi<Post>(`/posts/slug/${encodeURIComponent(slug)}`);
}

export default async function AdminPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostDirect(slug);

  if (!post) {
    notFound();
  }

  return <PostDetail post={post} />;
}
