'use client';

import { motion } from 'framer-motion';
import { MarkdownContent } from '@/shared/ui/MarkdownContent';
import { PostHeader } from '@/widgets/post/ui/PostHeader';
import { PostCommentSection } from '@/widgets/post/ui/PostCommentSection';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  category: {
    id: string;
    name: string;
    slug: string;
    icon?: string;
  };
  tags: {
    id: string;
    name: string;
  }[];
  author: {
    id: string;
    name: string;
  };
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured: boolean;
  views: number;
  likes: number;
  seo?: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface PostDetailClientProps {
  post: Post;
}

export function PostDetailClient({ post }: PostDetailClientProps) {
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

        {/* Content */}
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
