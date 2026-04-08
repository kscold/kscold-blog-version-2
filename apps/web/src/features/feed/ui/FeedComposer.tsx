'use client';

import { motion } from 'framer-motion';
import type { User } from '@/types/user';
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

  if (!currentUser) return null;

  return (
    <motion.section
      data-cy="feed-composer"
      className="mb-8 overflow-hidden rounded-[32px] border border-surface-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.06)]"
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
