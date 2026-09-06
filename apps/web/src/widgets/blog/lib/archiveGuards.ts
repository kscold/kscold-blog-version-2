import type { Category, PostSummary, TagUsage } from '@/shared/model/types/blog';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasString(record: UnknownRecord, key: string) {
  return typeof record[key] === 'string' && record[key].length > 0;
}

function hasOptionalString(record: UnknownRecord, key: string) {
  return record[key] === undefined || record[key] === null || typeof record[key] === 'string';
}

function hasOptionalBoolean(record: UnknownRecord, key: string) {
  return record[key] === undefined || record[key] === null || typeof record[key] === 'boolean';
}

function isPostCategory(value: unknown) {
  return isRecord(value) && hasString(value, 'id') && hasString(value, 'name') && hasString(value, 'slug');
}

function isPostTag(value: unknown) {
  return isRecord(value) && hasString(value, 'id') && hasString(value, 'name') && hasString(value, 'slug');
}

function isPostAuthor(value: unknown) {
  return isRecord(value) && hasString(value, 'id') && hasString(value, 'name');
}

function isPostSeo(value: unknown) {
  if (value === undefined || value === null) return true;
  return (
    isRecord(value) &&
    hasOptionalString(value, 'metaTitle') &&
    hasOptionalString(value, 'metaDescription') &&
    (value.keywords === null ||
      (Array.isArray(value.keywords) && value.keywords.every(item => typeof item === 'string')))
  );
}

export function isPostSummary(value: unknown): value is PostSummary {
  if (!isRecord(value)) return false;
  return (
    hasString(value, 'id') &&
    hasString(value, 'title') &&
    hasString(value, 'slug') &&
    value.content === null &&
    typeof value.excerpt === 'string' &&
    isPostCategory(value.category) &&
    Array.isArray(value.tags) &&
    value.tags.every(isPostTag) &&
    isPostAuthor(value.author) &&
    ['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(String(value.status)) &&
    (value.source === undefined ||
      value.source === null ||
      value.source === 'MANUAL' ||
      value.source === 'MARKDOWN_IMPORT') &&
    hasOptionalString(value, 'coverImage') &&
    hasOptionalString(value, 'originalFilename') &&
    typeof value.featured === 'boolean' &&
    hasOptionalBoolean(value, 'publicOverride') &&
    hasOptionalBoolean(value, 'restricted') &&
    Number.isSafeInteger(value.views) &&
    Number.isSafeInteger(value.likes) &&
    isPostSeo(value.seo) &&
    hasOptionalString(value, 'publishedAt') &&
    hasString(value, 'createdAt') &&
    hasString(value, 'updatedAt')
  );
}

export function isCategory(value: unknown): value is Category {
  if (!isRecord(value)) return false;
  return (
    hasString(value, 'id') &&
    hasString(value, 'name') &&
    hasString(value, 'slug') &&
    Array.isArray(value.ancestors) &&
    value.ancestors.every(item => typeof item === 'string') &&
    Number.isSafeInteger(value.depth) &&
    Number.isSafeInteger(value.order) &&
    Number.isSafeInteger(value.postCount) &&
    hasOptionalString(value, 'description') &&
    hasOptionalString(value, 'parent') &&
    hasOptionalString(value, 'icon') &&
    hasOptionalString(value, 'color') &&
    hasOptionalBoolean(value, 'restricted') &&
    (value.children === undefined ||
      (Array.isArray(value.children) && value.children.every(isCategory))) &&
    (value.createdAt === null || hasString(value, 'createdAt')) &&
    (value.updatedAt === null || hasString(value, 'updatedAt'))
  );
}

export function isTagUsage(value: unknown): value is TagUsage {
  if (!isRecord(value)) return false;
  return (
    hasString(value, 'name') &&
    (value.id === null || hasString(value, 'id')) &&
    (value.slug === null || hasString(value, 'slug')) &&
    (value.categoryId === null || typeof value.categoryId === 'string') &&
    (value.categoryName === null || typeof value.categoryName === 'string') &&
    (value.publicPostCount === undefined ||
      value.publicPostCount === null ||
      Number.isSafeInteger(value.publicPostCount)) &&
    Number.isSafeInteger(value.postCount) &&
    Number.isSafeInteger(value.feedCount) &&
    Number.isSafeInteger(value.totalCount) &&
    typeof value.unregistered === 'boolean'
  );
}

export function isRegisteredTagUsage(
  value: TagUsage
): value is TagUsage & { id: string; slug: string } {
  return typeof value.id === 'string' && value.id.length > 0 && typeof value.slug === 'string';
}

export function hasTagUsageSlug(value: unknown, slug: string) {
  return isRecord(value) && value.slug === slug;
}
