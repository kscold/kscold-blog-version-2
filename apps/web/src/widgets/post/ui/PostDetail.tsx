'use client';

import { motion } from 'framer-motion';
import { MarkdownContent } from '@/shared/ui/MarkdownContent';
import { PostHeader } from '@/widgets/post/ui/PostHeader';
import { PostCommentSection } from '@/widgets/post/ui/PostCommentSection';
import type { Post } from '@/types/blog';

interface PostDetailProps {
  post: Post;
}

export function PostDetail({ post }: PostDetailProps) {
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="min-h-screen bg-surface-50">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PostHeader
          title={post.title}
          excerpt={post.excerpt}
          coverImage={post.coverImage}
          category={post.category}
          author={post.author}
          views={post.views}
          likes={post.likes}
          featured={post.featured}
          formattedDate={formattedDate}
        />

        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <MarkdownContent content={post.content} />
        </motion.div>

        <PostCommentSection tags={post.tags} />
      </article>
    </div>
  );
}
