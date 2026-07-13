'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { User } from '@/shared/model/types/user';
import { useFeedComposer } from '@/features/feed/lib/useFeedComposer';
import { FeedComposerActions } from './FeedComposerActions';
import { FeedComposerEditorCard } from './FeedComposerEditorCard';
import { FeedComposerExpandedPanels } from './FeedComposerExpandedPanels';
import { FeedComposerHeader } from './FeedComposerHeader';
import { FeedComposerHighlights } from './FeedComposerHighlights';

interface FeedComposerProps {
  currentUser: User | null;
}

export function FeedComposer({ currentUser }: FeedComposerProps) {
  const {
    content,
    setContent,
    images,
    setImages,
    linkUrl,
    setLinkUrl,
    isExpanded,
    setIsExpanded,
    hasDraft,
    shouldShowExpanded,
    initials,
    linkPreview,
    createFeed,
    isUploading,
    fileInputRef,
    handleImageUpload,
    handleReset,
    handleSubmit,
    handlePaste,
    handleDrop,
  } = useFeedComposer(currentUser);

  if (!currentUser) {
    return (
      <motion.section
        className="mb-8 overflow-hidden rounded-[32px] border border-surface-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.06)]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3 border-b border-surface-100 px-5 py-4 sm:px-6">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-100">
            <svg className="h-4 w-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <p className="flex-1 text-sm text-surface-400">오늘 어떤 생각을 하셨나요?</p>
        </div>
        <div className="px-5 py-5 sm:px-6">
          <p className="mb-4 text-sm text-surface-500 leading-relaxed">
            로그인하면 일상, 개발 메모, 생각의 조각들을 피드에 기록할 수 있습니다.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-surface-900 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-surface-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            로그인하고 글 쓰기
          </Link>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      data-cy="feed-composer"
      className="mb-8 overflow-hidden rounded-[32px] border border-surface-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.06)] [word-break:keep-all]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <FeedComposerHeader currentUser={currentUser} initials={initials} />

      <div className="space-y-5 px-5 py-6 sm:px-6 sm:py-7">
        <FeedComposerHighlights />
        <FeedComposerEditorCard
          content={content}
          shouldShowExpanded={shouldShowExpanded}
          onContentChange={setContent}
          onExpand={() => setIsExpanded(true)}
          onPaste={handlePaste}
          onDrop={handleDrop}
        />
        <FeedComposerExpandedPanels
          shouldShowExpanded={shouldShowExpanded}
          images={images}
          linkUrl={linkUrl}
          linkPreview={linkPreview}
          onRemoveImage={index => setImages(prev => prev.filter((_, idx) => idx !== index))}
          onLinkUrlChange={setLinkUrl}
          onExpand={() => setIsExpanded(true)}
        />
        <FeedComposerActions
          hasDraft={hasDraft}
          isUploading={isUploading}
          isSubmitting={createFeed.isPending}
          canSubmit={Boolean(content.trim() || images.length)}
          fileInputRef={fileInputRef}
          onUploadFiles={handleImageUpload}
          onToggleExpanded={() => setIsExpanded(prev => !prev)}
          onReset={handleReset}
          onSubmit={handleSubmit}
          shouldShowExpanded={shouldShowExpanded}
        />
      </div>
    </motion.section>
  );
}
