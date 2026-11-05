/**
 * 짧은 노트 여러 개를 주제별 정리 노트 하나로 합친 뒤, 옛 노트 주소를 정리 노트로 보내는 표.
 *
 * 메서드 하나·데코레이터 하나만 적힌 짧은 노트가 수백 개 흩어져 있으면 검색엔진과 애드센스가
 * 사이트를 "가치가 별로 없는 콘텐츠"로 본다. 그래서 같은 주제를 정리 노트로 묶고, 옛 주소는
 * 301로 넘겨 링크와 검색 신호를 정리 노트가 이어받게 한다.
 * Obsidian 원본의 짧은 노트는 지우지 않으므로, 동기화로 다시 들어와도 이 표가 주소를 넘긴다.
 *
 * 키는 옛 노트 slug, 값은 정리 노트 slug 이다.
 */
const TYPEORM_REPOSITORY_HUB = 'typeorm-repository-메서드-정리';

export const MERGED_VAULT_NOTES: Readonly<Record<string, string>> = {
  typeormfind: TYPEORM_REPOSITORY_HUB,
  typeormfindone: TYPEORM_REPOSITORY_HUB,
  typeormfindoneorfail: TYPEORM_REPOSITORY_HUB,
  typeormfindandcount: TYPEORM_REPOSITORY_HUB,
  typeormexists: TYPEORM_REPOSITORY_HUB,
  typeormcount: TYPEORM_REPOSITORY_HUB,
  typeormsum: TYPEORM_REPOSITORY_HUB,
  typeormaverage: TYPEORM_REPOSITORY_HUB,
  typeormmaximun: TYPEORM_REPOSITORY_HUB,
  typeormminimun: TYPEORM_REPOSITORY_HUB,
  typeormcreate: TYPEORM_REPOSITORY_HUB,
  typeormsave: TYPEORM_REPOSITORY_HUB,
  typeorminsert: TYPEORM_REPOSITORY_HUB,
  typeormupsert: TYPEORM_REPOSITORY_HUB,
  typeormpreload: TYPEORM_REPOSITORY_HUB,
  typeormupdate: TYPEORM_REPOSITORY_HUB,
  typeormdelete: TYPEORM_REPOSITORY_HUB,
  typeormremove: TYPEORM_REPOSITORY_HUB,
  typeormsoftdelete: TYPEORM_REPOSITORY_HUB,
  typeormrestore: TYPEORM_REPOSITORY_HUB,
  deleteresult: TYPEORM_REPOSITORY_HUB,
};

/** 합쳐진 노트면 정리 노트 slug 를, 아니면 null 을 돌려준다. */
export function findMergedVaultNoteTarget(slug: string): string | null {
  return Object.hasOwn(MERGED_VAULT_NOTES, slug) ? MERGED_VAULT_NOTES[slug] : null;
}
