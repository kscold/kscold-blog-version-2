import type { Metadata } from 'next';
import {
  buildTagArchiveMetadata,
  loadTagArchive,
  TagArchive,
} from '@/widgets/blog/tag';

interface TagPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string | string[]; sort?: string | string[]; type?: string | string[]; feedPage?: string | string[] }>;
}

export async function generateMetadata({ params, searchParams }: TagPageProps): Promise<Metadata> {
  const [{ slug }, { page, ...query }] = await Promise.all([params, searchParams]);
  const archive = await loadTagArchive(slug, page, query);
  return buildTagArchiveMetadata(archive);
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const [{ slug }, { page, ...query }] = await Promise.all([params, searchParams]);
  const archive = await loadTagArchive(slug, page, query);
  return <TagArchive {...archive} />;
}

export const revalidate = 300;
