'use client';

import dynamic from 'next/dynamic';
import {
  type FeedPreview,
  toFeedTitle,
} from '@/shared/lib/seo/text';
import { LinkifiedText } from '@/shared/ui/LinkifiedText';

const MarkdownContent = dynamic(
  () => import('@/shared/ui/MarkdownContent').then(module => module.MarkdownContent)
);

interface FeedContentProps {
  authorName: string;
  content?: string;
  preview: FeedPreview;
  linkPreviewTitle?: string;
  variant: 'summary' | 'detail';
}

export function FeedContent({
  authorName,
  content,
  preview,
  linkPreviewTitle,
  variant,
}: FeedContentProps) {
  if (variant === 'detail') {
    if (!content?.trim()) {
      return null;
    }

    const title = toFeedTitle(content, linkPreviewTitle, `${authorName}의 피드`);

    return (
      <div className="px-5 py-6 sm:px-7 sm:py-8 [&_.markdown-source-h1]:mb-8 [&_.markdown-source-h1]:text-[2rem] [&_.markdown-source-h1]:leading-[1.16] [&_.markdown-source-h1]:tracking-[-0.035em] sm:[&_.markdown-source-h1]:mb-10 sm:[&_.markdown-source-h1]:text-[2.5rem] lg:[&_.markdown-source-h1]:text-[2.75rem]">
        <h1 className="sr-only">{title}</h1>
        <MarkdownContent content={content} prioritizeFirstImage demotePrimaryHeading />
      </div>
    );
  }

  if (!preview.heading && !preview.text) {
    return null;
  }

  return (
    <div className="px-4 py-3 [&_a]:relative [&_a]:z-20">
      {preview.heading && (
        <h2 className="mb-2 text-base font-bold leading-snug tracking-[-0.01em] text-surface-900 sm:text-lg">
          {preview.heading}
        </h2>
      )}
      {preview.text && (
        <LinkifiedText
          text={preview.text}
          className="text-sm leading-relaxed text-surface-800"
          // 제목이 서면 카드 상단의 작성자 이름과 겹치므로 이름 접두사를 빼고 본문만 읽히게 둔다.
          prefix={
            preview.heading ? undefined : (
              <span className="mr-1.5 font-bold text-surface-900">{authorName}</span>
            )
          }
        />
      )}
      {preview.hasMore && (
        <p className="mt-2 text-xs font-semibold text-surface-600">상세에서 계속 읽기</p>
      )}
    </div>
  );
}
