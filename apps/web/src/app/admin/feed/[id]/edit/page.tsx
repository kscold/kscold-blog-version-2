'use client';

import { useParams } from 'next/navigation';
import { FeedEditEditor } from '@/widgets/admin/ui/feed/FeedEditEditor';

export default function EditFeedPage() {
  const { id } = useParams<{ id: string }>();

  return <FeedEditEditor feedId={id} />;
}
