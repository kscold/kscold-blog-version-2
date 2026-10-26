import { PUBLICATION, getPostPublication } from '@/entities/post';
import type { Post } from '@/shared/model/types/blog';

export function PostStatusBadge({ post }: { post: Pick<Post, 'status' | 'restricted'> }) {
  const badge = PUBLICATION[getPostPublication(post)];
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${badge.color}`}
    >
      {badge.label}
    </span>
  );
}
