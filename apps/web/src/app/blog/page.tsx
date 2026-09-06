import { buildBlogArchiveMetadata, loadBlogArchive } from '@/widgets/blog/archive';
import { BlogPageView } from './BlogPageView';

interface BlogPageProps {
  searchParams: Promise<{ page?: string | string[] }>;
}

export async function generateMetadata({ searchParams }: BlogPageProps) {
  const archive = await loadBlogArchive((await searchParams).page);
  return buildBlogArchiveMetadata(archive.page);
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const archive = await loadBlogArchive((await searchParams).page);
  return <BlogPageView archive={archive} />;
}
