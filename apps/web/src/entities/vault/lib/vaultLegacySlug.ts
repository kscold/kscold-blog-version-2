import type { VaultNoteTitle } from '@/shared/model/types/vault';

/** 하이픈 유무와 대소문자 차이를 지운 비교용 값. */
function toComparableSlug(slug: string) {
  return slug.replace(/-/g, '').toLowerCase();
}

/**
 * 지금은 없는 주소가 예전 주소 체계의 것인지 확인해, 같은 노트의 현재 slug를 돌려준다.
 *
 * 예전에는 제목의 기호를 하이픈으로 바꿨고(typeorm-delete) 지금은 기호를 지운다(typeormdelete).
 * 검색엔진과 외부 글에 남은 예전 주소가 404로 끝나지 않도록, 하이픈만 다른 노트가 정확히 하나일 때만 돌려준다.
 */
export function findCurrentVaultSlug(
  requestedSlug: string,
  titleIndex: readonly VaultNoteTitle[]
): string | undefined {
  const target = toComparableSlug(requestedSlug);
  if (!target) {
    return undefined;
  }

  const candidates = new Set<string>();
  for (const item of titleIndex) {
    if (item.slug && toComparableSlug(item.slug) === target) {
      candidates.add(item.slug);
    }
  }
  if (candidates.size !== 1) {
    return undefined;
  }

  const [currentSlug] = candidates;
  // 같은 주소로 다시 보내면 이동이 끝나지 않는다.
  return currentSlug === requestedSlug ? undefined : currentSlug;
}
