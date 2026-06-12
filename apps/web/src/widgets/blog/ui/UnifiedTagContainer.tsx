'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTags } from '@/entities/tag/api/useTags';
import { usePostsByTag } from '@/entities/post/api/usePosts';
import { useFeeds } from '@/entities/feed/api/useFeeds';
import { PostCard } from '@/entities/post/ui/PostCard';
import { FeedCard } from '@/features/feed/ui/FeedCard';
import { usePerformanceMode } from '@/shared/model/usePerformanceMode';
import { Pagination } from '@/shared/ui/Pagination';
import { AdSenseScript } from '@/shared/ui/AdSenseScript';

interface UnifiedTagContainerProps {
  tagName: string;
}

export function UnifiedTagContainer({ tagName }: UnifiedTagContainerProps) {
  const [postPage, setPostPage] = useState(0);
  const [feedPage, setFeedPage] = useState(0);
  const { allowRichEffects } = usePerformanceMode();

  const { data: tags = [] } = useTags();
  const blogTag = tags.find(
    t => t.name.toLowerCase() === tagName.toLowerCase() || t.slug === tagName
  );

  const { data: postsData, isLoading: postsLoading } = usePostsByTag(blogTag?.id || '', postPage, 9);
  const { data: feedsData, isLoading: feedsLoading } = useFeeds({ page: feedPage, size: 9, tag: tagName });

  const posts = postsData?.content || [];
  const totalPostPages = postsData?.totalPages || 0;
  const feeds = feedsData?.content || [];
  const totalFeedPages = feedsData?.totalPages || 0;

  const postCount = postsData?.totalElements || 0;
  const feedCount = feedsData?.totalElements || 0;

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {(posts.length > 0 || feeds.length > 0) && <AdSenseScript />}
        {/* 브레드크럼 */}
        <motion.nav
          className="mb-8 flex items-center gap-2 text-sm text-surface-500"
          initial={allowRichEffects ? { opacity: 0, y: -10 } : false}
          animate={allowRichEffects ? { opacity: 1, y: 0 } : undefined}
          transition={allowRichEffects ? { duration: 0.4 } : undefined}
        >
          <Link href="/" className="hover:text-surface-900 transition-colors">홈</Link>
          <span className="text-surface-300">/</span>
          <span className="text-surface-900 font-medium">#{tagName}</span>
        </motion.nav>

        {/* 헤더 */}
        <motion.div
          className="mb-12"
          initial={allowRichEffects ? { opacity: 0, y: 20 } : false}
          animate={allowRichEffects ? { opacity: 1, y: 0 } : undefined}
          transition={allowRichEffects ? { duration: 0.6 } : undefined}
        >
          <h1 className="text-5xl font-sans font-black tracking-tight text-surface-900 mb-2">
            #{tagName}
          </h1>
          <p className="text-sm text-surface-400">
            블로그 {postCount}편 · 피드 {feedCount}개
          </p>
        </motion.div>

        {/* 블로그 포스트 섹션 */}
        {(postsLoading || posts.length > 0 || blogTag) && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xs font-bold text-surface-400 uppercase tracking-[0.2em]">
                Blog
              </h2>
              {!postsLoading && (
                <span className="text-xs font-mono text-surface-400">{postCount}</span>
              )}
            </div>

            {postsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-72 bg-white border border-surface-200 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : posts.length > 0 ? (
              <>
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8"
                  initial={allowRichEffects ? 'hidden' : false}
                  animate={allowRichEffects ? 'visible' : undefined}
                  variants={allowRichEffects ? { visible: { transition: { staggerChildren: 0.08 } } } : undefined}
                >
                  {posts.map(post => (
                    <motion.div
                      key={post.id}
                      variants={allowRichEffects ? { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } } : undefined}
                      transition={allowRichEffects ? { duration: 0.4 } : undefined}
                    >
                      <PostCard post={post} />
                    </motion.div>
                  ))}
                </motion.div>
                <Pagination page={postPage} totalPages={totalPostPages} onPageChange={setPostPage} />
              </>
            ) : (
              <p className="text-sm text-surface-400">이 태그의 블로그 포스트가 없습니다.</p>
            )}
          </section>
        )}

        {/* 피드 섹션 */}
        {(feedsLoading || feeds.length > 0) && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xs font-bold text-surface-400 uppercase tracking-[0.2em]">
                Feed
              </h2>
              {!feedsLoading && (
                <span className="text-xs font-mono text-surface-400">{feedCount}</span>
              )}
            </div>

            {feedsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-48 bg-white border border-surface-200 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : feeds.length > 0 ? (
              <>
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
                  initial={allowRichEffects ? 'hidden' : false}
                  animate={allowRichEffects ? 'visible' : undefined}
                  variants={allowRichEffects ? { visible: { transition: { staggerChildren: 0.08 } } } : undefined}
                >
                  {feeds.map(feed => (
                    <motion.div
                      key={feed.id}
                      variants={allowRichEffects ? { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } } : undefined}
                      transition={allowRichEffects ? { duration: 0.4 } : undefined}
                    >
                      <FeedCard feed={feed} />
                    </motion.div>
                  ))}
                </motion.div>
                <Pagination page={feedPage} totalPages={totalFeedPages} onPageChange={setFeedPage} />
              </>
            ) : null}
          </section>
        )}

        {/* 둘 다 없을 때 */}
        {!postsLoading && !feedsLoading && posts.length === 0 && feeds.length === 0 && (
          <div className="text-center py-24">
            <h2 className="text-2xl font-black text-surface-900 mb-2">콘텐츠가 없습니다</h2>
            <p className="text-surface-500 mb-6">#{tagName} 태그에 연결된 포스트나 피드가 없습니다.</p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/blog" className="text-sm text-surface-500 hover:text-surface-900 transition-colors">블로그 보기</Link>
              <span className="text-surface-300">·</span>
              <Link href="/feed" className="text-sm text-surface-500 hover:text-surface-900 transition-colors">피드 보기</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
