import { SITE_DESCRIPTION } from './constants';

const FEED_PREVIEW_HEADING_LENGTH = 160;
const FEED_PREVIEW_BODY_LENGTH = 320;

export interface FeedPreview {
  heading: string | null;
  text: string;
  hasMore: boolean;
}

export function stripRichText(input: string) {
  return input
    .replace(/^---[ \t]*\r?\n[\s\S]*?\r?\n---[ \t]*(?:\r?\n|$)/, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/~~~[\s\S]*?~~~/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[\[[^\]]*]?]?/g, ' ')
    .replace(/!\[[^\]]*]?\([^)]*(?:\)|$)/g, ' ')
    .replace(/!\[[^\]]*]?/g, ' ')
    .replace(/\[\[([^\]|]+)\|([^\]]+)]]/g, '$2')
    .replace(/\[\[([^\]|]+)(?:\|[^\]]+)?]]/g, '$1')
    .replace(/\[([^\]]+)]\([^)]*(?:\)|$)/g, '$1')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-+*]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^\s*>+\s?/gm, '')
    .replace(/[!*_~`>#\[\]()`|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractFirstMarkdownHeading(input?: string | null) {
  return input?.match(/^#{1,6}\s+(.+)$/m)?.[1].trim() || null;
}

/** 제목을 따로 보여줄 때 본문 미리보기에서 그 제목 줄만 덜어낸다. */
export function stripFirstMarkdownHeading(input?: string | null) {
  if (!input) return '';
  return input.replace(/^#{1,6}[ \t]+.+$/m, '').replace(/^\s+/, '');
}

export function extractFirstMarkdownImage(input?: string | null) {
  return input?.match(/!\[[^\]]*]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/)?.[1] || null;
}

export function toPreviewText(input?: string | null, fallback = '', maxLength = 180) {
  const cleaned = input ? stripRichText(input) : '';
  const base = cleaned || fallback;

  if (base.length <= maxLength) {
    return base;
  }

  return `${base.slice(0, maxLength - 3).trim()}...`;
}

export function toFeedPreview(input?: string | null): FeedPreview {
  const content = input ?? '';
  const rawHeading = extractFirstMarkdownHeading(content);
  const plainHeading = rawHeading ? stripRichText(rawHeading) : '';
  const heading = rawHeading
    ? toPreviewText(rawHeading, '', FEED_PREVIEW_HEADING_LENGTH) || null
    : null;
  const body = rawHeading ? stripFirstMarkdownHeading(content) : content;
  const plainBody = stripRichText(body);

  return {
    heading,
    text: toPreviewText(body, '', FEED_PREVIEW_BODY_LENGTH),
    hasMore:
      plainHeading.length > FEED_PREVIEW_HEADING_LENGTH ||
      plainBody.length > FEED_PREVIEW_BODY_LENGTH,
  };
}

export function toMetaDescription(
  input?: string | null,
  fallback = SITE_DESCRIPTION,
  maxLength = 160
) {
  return toPreviewText(input, fallback, maxLength);
}

/** 피드 메타데이터와 문서 주 제목이 항상 같은 우선순위를 사용하게 한다. */
export function toFeedTitle(
  content?: string | null,
  linkPreviewTitle?: string | null,
  fallback = '피드'
) {
  return (
    extractFirstMarkdownHeading(content) ||
    toMetaDescription(content, '', 58) ||
    linkPreviewTitle?.trim() ||
    fallback
  );
}

export function uniqueKeywords(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values
        .map(value => value?.trim())
        .filter((value): value is string => Boolean(value))
    )
  );
}
