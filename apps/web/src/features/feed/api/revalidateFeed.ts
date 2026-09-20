'use server';

import { revalidatePath } from 'next/cache';

const FEED_ID_PATTERN = /^[a-f0-9]{24}$/;

/**
 * 피드를 고치거나 지운 뒤 서버에 캐시된 페이지를 비운다.
 *
 * 상세 페이지는 1시간 단위로 다시 만들어지는데, 글을 수정해도 그 캐시를 비우는 곳이 없어
 * 고친 내용이 최대 한 시간 동안 보이지 않았다. 클라이언트 쿼리 캐시만 무효화해서는
 * 새로고침하거나 다른 사람이 볼 때 옛 HTML 이 그대로 나간다.
 */
export async function revalidateFeed(feedId?: string) {
  revalidatePath('/feed');
  // 아무 경로나 비울 수 없도록 몽고 아이디 형태만 받는다.
  if (feedId && FEED_ID_PATTERN.test(feedId)) {
    revalidatePath(`/feed/${feedId}`);
  }
}
