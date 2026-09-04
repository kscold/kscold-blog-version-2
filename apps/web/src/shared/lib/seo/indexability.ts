import {
  MIN_INDEXABLE_CONTENT_LENGTH,
  MIN_INDEXABLE_TAG_POST_COUNT,
  MIN_INDEXABLE_VAULT_CONTENT_LENGTH,
} from './constants';

const INTERNAL_TAG_SLUGS = new Set(['public', 'private']);

export function isIndexableFeed(content?: string | null) {
  return (content?.trim().length ?? 0) >= MIN_INDEXABLE_CONTENT_LENGTH;
}

export function isIndexableVaultNote(contentLength?: number | null) {
  return typeof contentLength === 'number' && contentLength >= MIN_INDEXABLE_VAULT_CONTENT_LENGTH;
}

export function isIndexableTag(tag: { slug: string; postCount: number }) {
  return !INTERNAL_TAG_SLUGS.has(tag.slug) && tag.postCount >= MIN_INDEXABLE_TAG_POST_COUNT;
}
