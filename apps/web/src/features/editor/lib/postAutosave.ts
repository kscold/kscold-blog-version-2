import { createPostForm } from './postForm';
import type { PostFormData } from '../model/types';

export interface PostAutosave {
  version: number;
  form: PostFormData;
  savedAt: string;
  postId?: string;
  updatedAt?: string;
}

const TEXT_FIELDS = ['title', 'slug', 'content', 'excerpt', 'coverImage', 'categoryId',
  'metaTitle', 'metaDescription', 'keywords'] as const;

/** 이전 형식도 작성 내용만 복구할 수 있게 읽되 임의의 속성은 form으로 넘기지 않는다. */
export function readPostAutosave(raw: string): PostAutosave | null {
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object') return null;
  const saved = value as Record<string, unknown>;
  if (saved.version !== undefined && saved.version !== 2) return null;
  if (!saved.form || typeof saved.form !== 'object' || typeof saved.savedAt !== 'string') return null;
  if (Number.isNaN(Date.parse(saved.savedAt))) return null;
  const fields = saved.form as Record<string, unknown>;
  if (typeof fields.title !== 'string' || typeof fields.content !== 'string') return null;
  if (!fields.title && !fields.content) return null;
  const form = createPostForm();
  for (const key of TEXT_FIELDS) if (typeof fields[key] === 'string') form[key] = fields[key];
  if (Array.isArray(fields.tagIds)) form.tagIds = fields.tagIds.filter((id): id is string => typeof id === 'string' && Boolean(id));
  form.featured = fields.featured === true;
  // 복구만으로 발행하지 않는다. 기존 글에서는 이 값들도 서버 기준으로 유지한다.
  return { version: saved.version === 2 ? 2 : 1, form, savedAt: saved.savedAt,
    postId: typeof saved.postId === 'string' ? saved.postId : undefined,
    updatedAt: typeof saved.updatedAt === 'string' ? saved.updatedAt : undefined,
  };
}
