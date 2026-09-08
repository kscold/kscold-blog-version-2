import { fetchPublicApi, isIndexableVaultNote } from '@/shared/lib/seo';

interface NoteIndexEntry {
  slug: string;
  contentLength: number;
}

export interface NoteDirectoryEntry {
  slug: string;
  name: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isIndexEntry(value: unknown): value is NoteIndexEntry {
  return isRecord(value) && typeof value.slug === 'string' &&
    typeof value.contentLength === 'number' && Number.isSafeInteger(value.contentLength) &&
    value.contentLength >= 0;
}

function isTitleEntry(value: unknown): value is NoteDirectoryEntry {
  return isRecord(value) && typeof value.slug === 'string' &&
    typeof value.name === 'string' && value.name.trim().length > 0;
}

export async function loadNoteDirectory(): Promise<NoteDirectoryEntry[]> {
  const [index, titles] = await Promise.all([
    fetchPublicApi<unknown>('/vault/notes/sitemap-index', 300),
    fetchPublicApi<unknown>('/vault/notes/title-index', 300),
  ]);
  if (!Array.isArray(index) || !index.every(isIndexEntry) ||
      !Array.isArray(titles) || !titles.every(isTitleEntry)) {
    throw new Error('공개 노트 목록 응답이 올바르지 않습니다.');
  }
  const names = new Map(titles.map(note => [note.slug, note.name]));
  // 본문 전체나 그래프를 전송하지 않고 사이트맵과 같은 노트에 탐색 링크를 제공한다.
  return index.filter(note => note.slug && isIndexableVaultNote(note.contentLength)).map(note => {
    const name = names.get(note.slug);
    if (!name) throw new Error('공개 노트 제목을 찾을 수 없습니다.');
    return { slug: note.slug, name };
  }).sort((left, right) => left.name.localeCompare(right.name, 'ko'));
}
