import {
  MIN_INDEXABLE_CONTENT_LENGTH,
  MIN_INDEXABLE_TAG_POST_COUNT,
  MIN_INDEXABLE_VAULT_CONTENT_LENGTH,
} from './constants';

const INTERNAL_TAG_SLUGS = new Set(['public', 'private']);

export function isIndexableFeed(content?: string | null) {
  return isIndexableFeedLength(
    content == null ? null : Array.from(content.trim()).length
  );
}

export function isIndexableFeedLength(contentLength?: number | null) {
  return typeof contentLength === 'number' && contentLength >= MIN_INDEXABLE_CONTENT_LENGTH;
}

export function isIndexableVaultNote(contentLength?: number | null) {
  return typeof contentLength === 'number' && contentLength >= MIN_INDEXABLE_VAULT_CONTENT_LENGTH;
}

/** MongoDB `$strLenCP`와 같은 Unicode code point 기준으로 Vault 본문 길이를 센다. */
export function isIndexableVaultContent(content?: string | null) {
  return isIndexableVaultNote(content == null ? null : Array.from(content).length);
}

export function isIndexableTag(tag: { slug: string; postCount: number }) {
  return !INTERNAL_TAG_SLUGS.has(tag.slug) && tag.postCount >= MIN_INDEXABLE_TAG_POST_COUNT;
}
