'use client';

import { useParams } from 'next/navigation';
import { PostEditEditor } from '@/widgets/admin';

export default function EditPostPage() {
  const params = useParams();
  const postId = params.id as string;

  return <PostEditEditor postId={postId} />;
}
