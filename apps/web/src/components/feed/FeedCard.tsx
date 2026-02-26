'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Feed } from '@/types/api';
import { useToggleLike } from '@/hooks/useFeeds';
import { ImageCarousel } from './ImageCarousel';
import { LinkPreviewCard } from './LinkPreviewCard';

interface FeedCardProps {
  feed: Feed;
  showCommentLink?: boolean;
}

export function FeedCard({ feed, showCommentLink = true }: FeedCardProps) {
  const toggleLike = useToggleLike();
  const [isLiked, setIsLiked] = useState(feed.isLiked);
  const [likesCount, setLikesCount] = useState(feed.likesCount);

  const handleLike = async () => {
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikesCount(wasLiked ? likesCount - 1 : likesCount + 1);

    try {
      await toggleLike.mutateAsync(feed.id);
    } catch {
      setIsLiked(wasLiked);
      setLikesCount(feed.likesCount);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return '방금';
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  return (
    <motion.article
      className="bg-white border border-surface-200 rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-9 h-9 bg-surface-200 rounded-full flex items-center justify-center overflow-hidden">
          {feed.author.avatar ? (
            <img src={feed.author.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-surface-600">
              {feed.author.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-surface-900">{feed.author.name}</p>
          <p className="text-xs text-surface-400">{formatTime(feed.createdAt)}</p>
        </div>
        {feed.visibility === 'PRIVATE' && (
          <span className="text-[10px] px-2 py-0.5 bg-surface-100 text-surface-500 rounded-full font-medium">
            비공개
          </span>
        )}
      </div>

      {/* Images */}
      {feed.images.length > 0 && <ImageCarousel images={feed.images} />}

      {/* Actions */}
      <div className="px-4 pt-3">
        <div className="flex items-center gap-4">
          <button onClick={handleLike} className="flex items-center gap-1.5 group">
            <motion.svg
              className={`w-6 h-6 transition-colors ${isLiked ? 'text-red-500 fill-red-500' : 'text-surface-700'}`}
              viewBox="0 0 24 24"
              fill={isLiked ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={2}
              whileTap={{ scale: 1.3 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </motion.svg>
            <span className={`text-sm font-bold ${isLiked ? 'text-red-500' : 'text-surface-700'}`}>
              {likesCount}
            </span>
          </button>

          {showCommentLink && (
            <Link href={`/feed/${feed.id}`} className="flex items-center gap-1.5 group">
              <svg
                className="w-6 h-6 text-surface-700 group-hover:text-surface-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
                />
              </svg>
              <span className="text-sm font-bold text-surface-700">{feed.commentsCount}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        <p className="text-sm text-surface-800 whitespace-pre-wrap leading-relaxed">
          <span className="font-bold text-surface-900 mr-1.5">{feed.author.name}</span>
          {feed.content}
        </p>
      </div>

      {/* Link Preview */}
      {feed.linkPreview && (
        <div className="px-4 pb-3">
          <LinkPreviewCard preview={feed.linkPreview} />
        </div>
      )}

      {/* Comment CTA */}
      {showCommentLink && feed.commentsCount > 0 && (
        <div className="px-4 pb-3">
          <Link
            href={`/feed/${feed.id}`}
            className="text-sm text-surface-400 hover:text-surface-600 transition-colors"
          >
            댓글 {feed.commentsCount}개 모두 보기
          </Link>
        </div>
      )}
    </motion.article>
  );
}
