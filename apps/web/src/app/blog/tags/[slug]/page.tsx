import type { Metadata } from 'next';
import {
  buildTagArchiveMetadata,
  loadTagArchive,
  TagArchive,
} from '@/widgets/blog/tag';

interface TagPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}

export async function generateMetadata({ params, searchParams }: TagPageProps): Promise<Metadata> {
  const [{ slug }, { page }] = await Promise.all([params, searchParams]);
  const archive = await loadTagArchive(slug, page);
  return buildTagArchiveMetadata(archive);
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const [{ slug }, { page }] = await Promise.all([params, searchParams]);
  const archive = await loadTagArchive(slug, page);
  return <TagArchive {...archive} />;
}

export const revalidate = 300;
