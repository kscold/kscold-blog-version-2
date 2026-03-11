'use client';

import { useParams } from 'next/navigation';
import { TagPostContainer } from '@/widgets/blog/ui/TagPostContainer';

export default function TagPage() {
  const params = useParams();
  const tagSlug = decodeURIComponent(params.slug as string);

  return <TagPostContainer tagSlug={tagSlug} />;
}
