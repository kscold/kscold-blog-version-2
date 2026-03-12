'use client';

import { useParams } from 'next/navigation';
import { FeedEditEditor } from '@/widgets/admin/ui/FeedEditEditor';

export default function EditFeedPage() {
  const { id } = useParams<{ id: string }>();

  return <FeedEditEditor feedId={id} />;
}
