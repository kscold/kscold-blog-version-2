'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { usePerformanceMode } from '@/shared/model/usePerformanceMode';
import { Post } from '@/types/blog';

interface PostCardProps {
  post: Post;
  featured?: boolean;
}

export function PostCard({ post, featured = false }: PostCardProps) {
  const { allowRichEffects, supportsHover, reduceMotion, isTouchDevice } = usePerformanceMode();
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <motion.article
      className={`group relative ${featured ? 'col-span-2 row-span-2' : ''}`}
      whileHover={supportsHover && allowRichEffects ? { y: -6, scale: 1.01 } : undefined}
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
      transition={allowRichEffects ? { type: 'spring', stiffness: 400, damping: 25 } : undefined}
    >
      <Link href={`/blog/${post.category.slug}/${post.slug}`} className="block h-full">
        <div className={`h-full bg-white border border-surface-200 rounded-[24px] p-6 transition-all duration-500 relative overflow-hidden ${supportsHover ? 'group-hover:border-surface-300 group-hover:bg-surface-50 group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]' : ''}`}>
          {/* 빛이 스쳐 지나가는 듯한 강조 효과 */}
          {supportsHover && allowRichEffects && (
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out pointer-events-none z-10 mix-blend-overlay" />
          )}

          {post.coverImage && (
            <div
              className={`relative overflow-hidden mb-6 rounded-[16px] ${
                featured ? 'h-64' : 'h-48'
              }`}
            >
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={`object-cover transition-transform duration-500 ${supportsHover ? 'group-hover:scale-110' : ''}`}
              />
              {post.featured && (
                <div className={`absolute top-4 right-4 px-3 py-1.5 text-[10px] font-bold text-surface-900 rounded-full uppercase tracking-widest shadow-sm ${isTouchDevice ? 'bg-white' : 'bg-white/90 backdrop-blur-md'}`}>
                  Featured
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 mb-3">
            {post.category.icon && (
              <span className="text-sm text-accent-light">{post.category.icon}</span>
            )}
            <span className="text-[11px] font-bold text-surface-900 uppercase tracking-widest">
              {post.category.name}
            </span>
            <span className="text-xs text-surface-400">•</span>
            <time className="text-xs text-surface-500 font-mono">{formattedDate}</time>
          </div>

          <h3
            className={`font-sans font-black tracking-tight text-surface-900 mb-3 group-hover:text-surface-600 transition-colors ${
              featured ? 'text-3xl' : 'text-xl'
            }`}
          >
            {post.title}
          </h3>

          <p
            className={`mb-6 text-sm font-medium leading-relaxed text-surface-500 break-words [overflow-wrap:anywhere] line-clamp-${
              featured ? '4' : '3'
            }`}
          >
            {post.excerpt}
          </p>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, featured ? 5 : 3).map(tag => (
                <span
                  key={tag.id}
                  className="px-2.5 py-1 text-[10px] font-bold bg-surface-100 text-surface-500 rounded-md group-hover:bg-surface-200 group-hover:text-surface-900 transition-colors uppercase tracking-wider"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 mt-6 pt-4 border-t border-surface-100">
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
