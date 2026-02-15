'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Post } from '@/types/api';

interface PostCardProps {
  post: Post;
  featured?: boolean;
}

export function PostCard({ post, featured = false }: PostCardProps) {
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <motion.article
      className={`group relative ${
        featured ? 'col-span-2 row-span-2' : ''
      }`}
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Link
        href={`/blog/${post.category.slug}/${post.slug}`}
        className="block h-full"
      >
        <div className="h-full bg-surface-900/40 backdrop-blur-md border border-white/5 rounded-[24px] p-6 transition-all duration-500 group-hover:border-accent-light/30 group-hover:bg-surface-900/60 group-hover:shadow-[0_20px_50px_-12px_rgba(6,182,212,0.25)] relative overflow-hidden">
          {/* Holographic Sliek Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out pointer-events-none z-0" />
          
          {post.coverImage && (
            <div
              className={`relative overflow-hidden mb-6 rounded-[16px] ${
                featured ? 'h-64' : 'h-48'
              }`}
            >
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {post.featured && (
                <div className="absolute top-3 right-3 px-3 py-1 text-xs font-bold bg-accent-blue text-white rounded-full uppercase tracking-wider shadow-lg">
                  Featured
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 mb-3">
            {post.category.icon && (
              <span className="text-sm text-accent-light">{post.category.icon}</span>
            )}
            <span className="text-xs font-bold text-accent-light uppercase tracking-widest">
              {post.category.name}
            </span>
            <span className="text-xs text-surface-600">•</span>
            <time className="text-xs text-surface-500 font-mono">
              {formattedDate}
            </time>
          </div>

          <h3
            className={`font-sans font-bold text-white mb-3 group-hover:text-accent-light transition-colors ${
              featured ? 'text-3xl' : 'text-xl'
            }`}
          >
            {post.title}
          </h3>

          <p
            className={`text-surface-400 mb-4 line-clamp-${
              featured ? '4' : '3'
            }`}
          >
            {post.excerpt}
          </p>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, featured ? 5 : 3).map((tag) => (
                <span
                  key={tag.id}
                  className="px-2 py-1 text-[10px] font-bold bg-surface-800 text-surface-300 border border-white/5 rounded-lg group-hover:border-accent-light/30 transition-colors uppercase tracking-wider"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 mt-6 pt-4 border-t border-white/5">
            <div className="flex items-center gap-1 text-xs text-surface-500 font-mono">
              <span className="uppercase">Views</span>
              <span>{post.views || 0}</span>
            </div>

            <div className="flex items-center gap-1 text-xs text-surface-500 font-mono">
              <span className="uppercase">Likes</span>
              <span>{post.likes || 0}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
