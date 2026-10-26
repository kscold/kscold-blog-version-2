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
  return findByHyphenless(requestedSlug, titleIndex) ?? findByHexPrefix(requestedSlug, titleIndex);
}

function findByHyphenless(
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

/** 「eca781eb」처럼 한 단어의 앞 4바이트를 적은 16진수에서 첫 글자(한글 한 자)를 되살린다. */
function decodeLeadingHangul(hex: string): string | undefined {
  const bytes = hex
    .match(/../g)
    ?.slice(0, 3)
    .map(byte => Number.parseInt(byte, 16));
  if (!bytes) return undefined;
  try {
    const char = new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(bytes));
    return /^[가-힣]$/.test(char) ? char : undefined;
  } catch {
    return undefined;
  }
}

/**
 * 더 예전 주소 체계는 한글 단어마다 UTF-8 앞 4바이트만 16진수로 남기고 뒤에 영어 제목을 붙였다.
 * (직렬화(serialization) → eca781eb-serialization, 같은 주소가 겹치면 -2를 더 붙였다.)
 * 한글 단어의 첫 글자들과 영어 꼬리가 모두 맞는 노트가 정확히 하나일 때만 돌려준다.
 */
function findByHexPrefix(
  requestedSlug: string,
  titleIndex: readonly VaultNoteTitle[]
): string | undefined {
  const match = /^((?:[0-9a-f]{8}-)*[0-9a-f]{8})(?:-(.*))?$/.exec(requestedSlug);
  if (!match) return undefined;

  const leads = match[1].split('-').map(decodeLeadingHangul);
  if (leads.some(lead => !lead)) return undefined;

  const tail = match[2] ?? '';
  // 겹친 주소에 붙은 -2 같은 꼬리는 원래 제목의 숫자일 수도 있으니, 그대로 먼저 맞춰 본다.
  const tails = /-\d+$/.test(tail) ? [tail, tail.replace(/-\d+$/, '')] : [tail];

  for (const candidateTail of tails) {
    const comparableTail = toComparableSlug(candidateTail);
    const candidates = new Set<string>();
    for (const item of titleIndex) {
      if (!item.slug) continue;
      const comparable = toComparableSlug(item.slug);
      if (!comparable.endsWith(comparableTail)) continue;
      const hangul = comparable.slice(0, comparable.length - comparableTail.length);
      if (/^[가-힣]+$/.test(hangul) && matchesWordLeads(item.slug, leads as string[])) {
        candidates.add(item.slug);
      }
    }
    if (candidates.size === 1) return [...candidates][0];
    if (candidates.size > 1) return undefined;
  }
  return undefined;
}

/** 한글이 든 단어 수가 같고, 단어마다 첫 글자가 차례대로 맞는지 본다. */
function matchesWordLeads(slug: string, leads: readonly string[]) {
  const words = slug.split('-').filter(word => /[가-힣]/.test(word));
  return (
    words.length === leads.length && words.every((word, index) => word.startsWith(leads[index]))
  );
}
