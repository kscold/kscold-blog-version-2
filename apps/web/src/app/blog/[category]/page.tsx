'use client';

import { useParams } from 'next/navigation';
import { CategoryPostContainer } from '@/widgets/blog/ui/CategoryPostContainer';

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params.category as string;

  return <CategoryPostContainer categorySlug={categorySlug} />;
}
