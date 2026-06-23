import { SITE_DESCRIPTION } from './constants';

export function stripRichText(input: string) {
  return input
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

export function toPreviewText(input?: string | null, fallback = '', maxLength = 180) {
  const cleaned = input ? stripRichText(input) : '';
  const base = cleaned || fallback;

  if (base.length <= maxLength) {
    return base;
  }

  return `${base.slice(0, maxLength - 3).trim()}...`;
}

export function toMetaDescription(
  input?: string | null,
  fallback = SITE_DESCRIPTION,
  maxLength = 160
) {
  return toPreviewText(input, fallback, maxLength);
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
