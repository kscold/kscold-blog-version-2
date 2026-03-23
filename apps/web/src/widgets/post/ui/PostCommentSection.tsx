'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

import type { Tag } from '@/types/blog';

type PostTagInfo = Pick<Tag, 'id' | 'name'>;

interface PostCommentSectionProps {
  tags: PostTagInfo[];
}

export function PostCommentSection({ tags }: PostCommentSectionProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    }
    setShowShareMenu(false);
  };

  const handleShareTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(document.title);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
    setShowShareMenu(false);
  };

  return (
    <>
      {/* Tags */}
      {tags && tags.length > 0 && (
        <motion.div
          className="mb-12 pt-8 border-t border-surface-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-sm font-bold text-surface-900 mb-4 uppercase tracking-wider">
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <Link
                key={tag.id}
                href={`/blog/tags/${encodeURIComponent(tag.name.toLowerCase())}`}
                className="px-3 py-1.5 bg-white border border-surface-200 text-surface-600 rounded-lg hover:border-surface-900 hover:text-surface-900 transition-all text-sm font-medium"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <motion.div
        className="flex justify-between items-center pt-8 border-t border-surface-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-surface-200 text-surface-700 rounded-lg hover:border-surface-900 hover:text-surface-900 transition-all font-medium text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          목록으로
        </Link>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowShareMenu(prev => !prev)}
            className="p-2.5 bg-white border border-surface-200 text-surface-600 rounded-lg hover:border-surface-900 hover:text-surface-900 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </button>

          {showShareMenu && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-surface-200 rounded-lg shadow-lg overflow-hidden z-50">
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-50 transition-colors text-left"
              >
                {copied ? '복사됨!' : '링크 복사'}
              </button>
              <button
                type="button"
                onClick={handleShareTwitter}
                className="w-full px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-50 transition-colors text-left"
              >
                X(Twitter)로 공유
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
