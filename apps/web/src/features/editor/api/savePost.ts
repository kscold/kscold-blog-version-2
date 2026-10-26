'use server';

import { revalidatePath } from 'next/cache';
import type { Post, PostCreateRequest, PostUpdateRequest } from '@/shared/model/types/blog';
import { validatePostSlug } from '@/shared/lib/postSlug';
import type { PostSaveResult } from '../model/types';
import { postAdminRequest, refreshPostPages, requirePostAdmin } from './postPublicationServer';

type SaveRequest = { id?: string; data: PostCreateRequest | PostUpdateRequest };
type SaveResponse = { ok: true; result: PostSaveResult } | { ok: false; message: string };
const POST_ID = /^[a-f0-9]{24}$/;

/** 저장 전의 실제 값과 저장 결과로만 캐시 갱신 대상을 정한다. */
export async function savePost(request: SaveRequest): Promise<SaveResponse> {
  let result: PostSaveResult;
  let previous: Post | null = null;
  try {
    const token = await requirePostAdmin();
    if (request.id !== undefined && !POST_ID.test(request.id)) throw new Error('글 식별자가 올바르지 않습니다.');
    const slug = request.data.slug;
    if (!request.id || slug !== undefined) {
      const error = validatePostSlug(typeof slug === 'string' ? slug : '');
      if (error) throw new Error(error);
    }
    if (request.id) previous = await postAdminRequest<Post>({ token, path: `/posts/${request.id}` });
    const post = await postAdminRequest<Post>({
      token, path: request.id ? `/posts/${request.id}` : '/posts',
      method: request.id ? 'PUT' : 'POST', data: request.data,
    });
    result = { post, cacheRefreshed: false };
  } catch (error) {
    return { ok: false, message: error instanceof Error && error.name === 'Error'
      ? error.message : '저장을 확인하지 못했습니다. 글 목록에서 저장 여부를 확인해 주세요.' };
  }
  // 저장과 화면 갱신을 분리해 갱신 실패가 글을 다시 생성하는 계기가 되지 않게 한다.
  try {
    refreshPostPages(previous ? [previous, result.post] : [result.post]);
    result.cacheRefreshed = true;
  } catch { /* 저장 결과는 그대로 반환한다. */ }
  return { ok: true, result };
}

export async function retryPostRefresh(id: string): Promise<boolean> {
  try {
    const token = await requirePostAdmin();
    if (!POST_ID.test(id)) return false;
    const post = await postAdminRequest<Post>({ token, path: `/posts/${id}` });
    refreshPostPages([post]);
    // 이전 주소·태그를 클라이언트에서 받는 대신, 재시도에서만 고정된 글 경로 패턴을 갱신한다.
    revalidatePath('/blog/[category]/[slug]', 'page');
    revalidatePath('/blog/[category]', 'page');
    revalidatePath('/blog/tags/[slug]', 'page');
    return true;
  } catch { return false; }
}
