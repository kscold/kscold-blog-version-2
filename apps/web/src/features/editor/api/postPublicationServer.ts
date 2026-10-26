import 'server-only';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { API_BASE_URL } from '@/shared/lib/seo/constants';
import type { Post } from '@/shared/model/types/blog';
import { getPostPath } from '@/entities/post';

/** 경로는 이 모듈이 정한다. 요청 본문에 임의의 API·캐시 경로를 받지 않는다. */
export async function requirePostAdmin() {
  const token = (await cookies()).get('auth-token')?.value;
  if (!token) throw new Error('관리자 로그인이 필요합니다.');
  const user = await postAdminRequest<{ role: string }>({ token, path: '/auth/me' });
  if (user.role !== 'ADMIN') throw new Error('관리자만 글을 저장할 수 있습니다.');
  return token;
}

interface AdminRequest {
  token: string;
  path: string;
  data?: unknown;
  method?: 'GET' | 'POST' | 'PUT';
}

export async function postAdminRequest<T>({ token, path, data, method = 'GET' }: AdminRequest): Promise<T> {
  const response = await fetch(`${process.env.API_INTERNAL_URL || API_BASE_URL}${path}`, {
    method, cache: 'no-store', signal: AbortSignal.timeout(15000),
    headers: { Cookie: `auth-token=${token}`, 'Content-Type': 'application/json' },
    ...(data === undefined ? {} : { body: JSON.stringify(data) }),
  });
  if (!response.ok) {
    if (response.status === 409) throw new Error('이미 사용 중인 글 주소입니다. 다른 주소를 입력해 주세요.');
    if (response.status === 401 || response.status === 403) throw new Error('관리자 로그인을 다시 확인해 주세요.');
    if (response.status === 404) throw new Error('글 또는 선택한 카테고리·태그를 찾을 수 없습니다.');
    throw new Error('글을 저장하지 못했습니다. 입력한 내용은 유지됩니다. 잠시 후 다시 시도해 주세요.');
  }
  const payload = await response.json();
  if (payload.success === false || !payload.data) throw new Error('저장 응답을 확인할 수 없습니다.');
  return payload.data as T;
}

export function refreshPostPages(posts: Post[]) {
  const paths = new Set(['/', '/blog', '/sitemap.xml', '/rss.xml']);
  for (const post of posts) {
    paths.add(getPostPath(post));
    paths.add(`/blog/${encodeURIComponent(post.category.slug)}`);
    for (const tag of post.tags ?? []) paths.add(`/blog/tags/${encodeURIComponent(tag.slug)}`);
  }
  for (const path of paths) revalidatePath(path);
}
