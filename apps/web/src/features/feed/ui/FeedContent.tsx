'use client';

import { stripRichText, toPreviewText } from '@/shared/lib/seo/text';
import { LinkifiedText } from '@/shared/ui/LinkifiedText';
import { MarkdownContent } from '@/shared/ui/MarkdownContent';

const FEED_PREVIEW_LENGTH = 320;

interface FeedContentProps {
  authorName: string;
  content: string;
  variant: 'summary' | 'detail';
}

export function FeedContent({ authorName, content, variant }: FeedContentProps) {
  if (!content.trim()) {
    return null;
  }

  if (variant === 'detail') {
    return (
      <div className="px-5 py-6 sm:px-7 sm:py-8 [&_.markdown-prose_h1]:mb-8 [&_.markdown-prose_h1]:text-[2rem] [&_.markdown-prose_h1]:leading-[1.16] [&_.markdown-prose_h1]:tracking-[-0.035em] sm:[&_.markdown-prose_h1]:mb-10 sm:[&_.markdown-prose_h1]:text-[2.5rem] lg:[&_.markdown-prose_h1]:text-[2.75rem]">
        <MarkdownContent content={content} />
      </div>
    );
  }

  const plainText = stripRichText(content);
  const preview = toPreviewText(content, '', FEED_PREVIEW_LENGTH);

  return (
    <div className="px-4 py-3">
      <LinkifiedText
        text={preview}
        className="text-sm leading-relaxed text-surface-800"
        prefix={<span className="mr-1.5 font-bold text-surface-900">{authorName}</span>}
      />
      {plainText.length > FEED_PREVIEW_LENGTH && (
        <p className="mt-2 text-xs font-semibold text-surface-400">상세에서 계속 읽기</p>
      )}
    </div>
  );
}
