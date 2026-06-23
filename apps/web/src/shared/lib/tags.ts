const SYSTEM_TAG_NAMES = new Set(['공개', '비공개']);

export function isSystemTagName(name: string) {
  return SYSTEM_TAG_NAMES.has(name.trim());
}

export function filterVisibleTagInfos<T extends { name: string }>(tags: T[] = []) {
  return tags.filter(tag => !isSystemTagName(tag.name));
}

export function filterVisibleTagNames(tags: string[] = []) {
  return tags.filter(tag => !isSystemTagName(tag));
}
