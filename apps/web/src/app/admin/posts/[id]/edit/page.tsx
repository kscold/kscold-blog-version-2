'use client';

import { useParams } from 'next/navigation';
import { PostEditEditor } from '@/widgets/admin/ui/PostEditEditor';

export default function EditPostPage() {
  const params = useParams();
  const postId = params.id as string;

  return <PostEditEditor postId={postId} />;
}
