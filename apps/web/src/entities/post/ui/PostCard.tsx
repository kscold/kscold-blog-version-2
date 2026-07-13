'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { usePerformanceMode } from '@/shared/model/usePerformanceMode';
import { filterVisibleTagInfos } from '@/shared/lib/tags';
import { toPreviewText } from '@/shared/lib/seo/text';
import { Post } from '@/shared/model/types/blog';

interface PostCardProps {
  post: Post;
  featured?: boolean;
  titleOnly?: boolean;
}

function LockIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}

function RestrictedPostBadge({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <span
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-100 text-surface-500"
        title="제한 글"
        aria-label="제한 글"
      >
        <LockIcon />
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-surface-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-surface-500"
      title="제한 글"
      aria-label="제한 글"
    >
      <LockIcon className="h-3 w-3" />
      비공개
    </span>
  );
}

export function PostCard({ post, featured = false, titleOnly = false }: PostCardProps) {
  const { allowRichEffects, supportsHover, reduceMotion, isTouchDevice } = usePerformanceMode();
  const visibleTags = filterVisibleTagInfos(post.tags);
  const isRestricted = Boolean(post.restricted);
  const previewText = toPreviewText(post.excerpt || post.content, post.title, featured ? 220 : 160);
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  if (titleOnly) {
    return (
      <Link
        href={`/blog/${post.category.slug}/${post.slug}`}
        className="group block border-b border-surface-200 py-5 transition-colors hover:text-surface-600"
      >
        <div className="flex items-center gap-2">
          <h3 className="font-sans font-black text-xl tracking-tight text-surface-900 group-hover:text-surface-600 transition-colors">
            {post.title}
          </h3>
          {isRestricted && <RestrictedPostBadge compact />}
        </div>
      </Link>
    );
  }

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
              className={`relative overflow-hidden mb-4 sm:mb-6 rounded-[16px] ${
                featured ? 'h-48 sm:h-64' : 'h-40 sm:h-48'
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
            {isRestricted && <RestrictedPostBadge />}
          </div>

          <h3
            className={`font-sans font-black tracking-tight text-surface-900 mb-3 group-hover:text-surface-600 transition-colors ${
              featured ? 'text-3xl' : 'text-xl'
            }`}
          >
            {post.title}
          </h3>

          <p
            className={`mb-6 text-sm font-medium leading-relaxed text-surface-500 break-words [overflow-wrap:anywhere] ${
              featured ? 'line-clamp-4' : 'line-clamp-3'
            }`}
          >
            {previewText}
          </p>

          {visibleTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {visibleTags.slice(0, featured ? 5 : 3).map(tag => (
                <Link
                  key={tag.id}
                  href={`/tags/${encodeURIComponent(tag.name)}`}
                  onClick={e => e.stopPropagation()}
                  className="px-2.5 py-1 text-[10px] font-bold bg-surface-100 text-surface-500 rounded-md hover:bg-surface-200 hover:text-surface-900 transition-colors tracking-wider"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-surface-100">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[11px] text-surface-400 font-mono">
                <span className="uppercase tracking-wider">Views</span>
                <span className="font-bold text-surface-600 tabular-nums">{post.views || 0}</span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-surface-400 font-mono">
                <span className="uppercase tracking-wider">Likes</span>
                <span className="font-bold text-surface-600 tabular-nums">{post.likes || 0}</span>
              </div>
            </div>

            <span
              aria-hidden="true"
              className={`text-surface-300 transition-all duration-300 ${supportsHover ? 'group-hover:text-surface-900 group-hover:translate-x-0.5' : ''}`}
            >
              →
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
