'use client';

import { motion } from 'framer-motion';
import FeedActionBar from '@/features/feed/ui/FeedActionBar';
import { useFeedEditor } from '@/features/feed/lib/useFeedEditor';
import { FeedEditorContentPanel } from '@/features/feed/ui/feed-editor/FeedEditorContentPanel';
import { FeedEditorHeader } from '@/features/feed/ui/feed-editor/FeedEditorHeader';
import { FeedEditorHighlights } from '@/features/feed/ui/feed-editor/FeedEditorHighlights';
import { FeedEditorLinkPanel } from '@/features/feed/ui/feed-editor/FeedEditorLinkPanel';
import { FeedEditorMediaPanel } from '@/features/feed/ui/feed-editor/FeedEditorMediaPanel';

interface FeedEditorProps {
  feedId?: string;
  initialContent?: string;
  initialImages?: string[];
  initialVisibility?: 'PUBLIC' | 'PRIVATE';
  initialLinkUrl?: string;
}

export default function FeedEditor({
  feedId,
  initialContent = '',
  initialImages = [],
  initialVisibility = 'PUBLIC',
  initialLinkUrl = '',
}: FeedEditorProps) {
  const {
    content,
    images,
    visibility,
    linkUrl,
    linkPreview,
    isUploading,
    isPending,
    setContent,
    setVisibility,
    setLinkUrl,
    handleImageUpload,
    handlePaste,
    handleDrop,
    handleSubmit,
    removeImage,
  } = useFeedEditor({
    feedId,
    initialContent,
    initialImages,
    initialVisibility,
    initialLinkUrl,
  });

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <FeedEditorHeader isEditing={Boolean(feedId)} />
        </motion.div>

        <motion.div
          className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="space-y-6">
            <FeedEditorContentPanel
              content={content}
              isEditing={Boolean(feedId)}
              onChange={setContent}
              onPaste={handlePaste}
              onDrop={handleDrop}
            />
            <FeedEditorHighlights />
            <FeedEditorMediaPanel images={images} onRemove={removeImage} />
            <FeedEditorLinkPanel
              linkUrl={linkUrl}
              linkPreview={linkPreview}
              onChange={setLinkUrl}
            />
          </div>

          <FeedActionBar
            visibility={visibility}
            isUploading={isUploading}
            isPending={isPending}
            isSubmitDisabled={!content.trim() && images.length === 0}
            contentLength={content.trim().length}
            imageCount={images.length}
            hasLink={Boolean(linkUrl.trim())}
            onVisibilityChange={setVisibility}
            onImageUpload={handleImageUpload}
            onSubmit={handleSubmit}
            submitLabel={feedId ? '변경사항 저장' : '피드 게시'}
          />
        </motion.div>
      </div>
    </div>
  );
}
