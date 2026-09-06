import type { Metadata } from 'next';
import {
  buildCategoryArchiveMetadata,
  CategoryArchive,
  loadCategoryArchive,
} from '@/widgets/blog/category';

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const [{ category }, { page }] = await Promise.all([params, searchParams]);
  const archive = await loadCategoryArchive(category, page);
  return buildCategoryArchiveMetadata(archive);
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const [{ category }, { page }] = await Promise.all([params, searchParams]);
  const archive = await loadCategoryArchive(category, page);
  return <CategoryArchive {...archive} />;
}

export const revalidate = 300;
