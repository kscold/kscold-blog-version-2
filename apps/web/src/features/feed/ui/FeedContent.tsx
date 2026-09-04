'use client';

import dynamic from 'next/dynamic';
import {
  extractFirstMarkdownHeading,
  stripFirstMarkdownHeading,
  stripRichText,
  toPreviewText,
} from '@/shared/lib/seo/text';
import { LinkifiedText } from '@/shared/ui/LinkifiedText';

const MarkdownContent = dynamic(
  () => import('@/shared/ui/MarkdownContent').then(module => module.MarkdownContent)
);

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

  // 제목이 있으면 본문에서 떼어내 제목 줄로 세우고, 미리보기는 그 아래 본문만 보여준다.
  const heading = extractFirstMarkdownHeading(content);
  const body = heading ? stripFirstMarkdownHeading(content) : content;
  const plainBody = stripRichText(body);
  const preview = toPreviewText(body, '', FEED_PREVIEW_LENGTH);

  return (
    <div className="px-4 py-3">
      {heading && (
        <h2 className="mb-2 text-base font-bold leading-snug tracking-[-0.01em] text-surface-900 sm:text-lg">
          {heading}
        </h2>
      )}
      {preview && (
        <LinkifiedText
          text={preview}
          className="text-sm leading-relaxed text-surface-800"
          // 제목이 서면 카드 상단의 작성자 이름과 겹치므로 이름 접두사를 빼고 본문만 읽히게 둔다.
          prefix={
            heading ? undefined : (
              <span className="mr-1.5 font-bold text-surface-900">{authorName}</span>
            )
          }
        />
      )}
      {plainBody.length > FEED_PREVIEW_LENGTH && (
        <p className="mt-2 text-xs font-semibold text-surface-400">상세에서 계속 읽기</p>
      )}
    </div>
  );
}
