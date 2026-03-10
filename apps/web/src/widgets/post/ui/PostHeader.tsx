'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface PostHeaderProps {
  title: string;
  excerpt: string;
  coverImage?: string;
  category: {
    name: string;
    slug: string;
    icon?: string;
  };
  author: {
    name: string;
  };
  views: number;
  likes: number;
  featured: boolean;
  formattedDate: string;
}

export function PostHeader({
  title,
  excerpt,
  coverImage,
  category,
  author,
  views,
  likes,
  featured,
  formattedDate,
}: PostHeaderProps) {
  return (
    <>
      {/* Breadcrumb */}
      <motion.nav
        className="mb-8 flex items-center gap-2 text-sm text-surface-500"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link href="/blog" className="hover:text-surface-900 transition-colors">
          Blog
        </Link>
        <span className="text-surface-300">/</span>
        <Link
          href={`/blog/${category.slug}`}
          className="hover:text-surface-900 transition-colors"
        >
          {category.name}
        </Link>
        <span className="text-surface-300">/</span>
        <span className="text-surface-400 truncate max-w-[200px]">{title}</span>
      </motion.nav>

      {/* Header */}
      <motion.header
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Category & Date */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href={`/blog/${category.slug}`}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-surface-900 text-white rounded-full text-sm font-medium hover:bg-surface-700 transition-colors"
          >
            {category.icon && <span>{category.icon}</span>}
            {category.name}
          </Link>
          <span className="text-sm text-surface-400">{formattedDate}</span>
          {featured && (
            <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-200">
              Featured
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-sans font-black tracking-tight text-surface-900 mb-6 leading-[1.1]">
          {title}
        </h1>

        {/* Excerpt */}
        <p className="text-lg text-surface-500 leading-relaxed mb-8">{excerpt}</p>

        {/* Meta */}
        <div className="flex items-center justify-between pb-8 border-b border-surface-200">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-surface-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>{author.name}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-surface-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span>{views}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-surface-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>{likes}</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Cover Image */}
      {coverImage && (
        <motion.div
          className="mb-12 rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Image src={coverImage} alt={title} width={1200} height={630} className="w-full h-auto" />
        </motion.div>
      )}
    </>
  );
}
