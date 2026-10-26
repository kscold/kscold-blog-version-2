const POST_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** 새 글에서만 제안한다. 한글·혼합 제목을 임의로 음역하거나 잘라내지 않는다. */
export function suggestPostSlug(title: string): string {
  if (/[^\x00-\x7F]/.test(title)) return '';
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
    .slice(0, 100).replace(/^-+|-+$/g, '');
}

export function validatePostSlug(slug: string): string | null {
  if (!slug) return '서버에 저장하기 전에 영문 글 주소를 입력해 주세요.';
  if (slug.length > 100) return '글 주소는 100자 이내로 입력해 주세요.';
  if (!POST_SLUG_PATTERN.test(slug)) return '영문 소문자·숫자를 하이픈(-)으로 연결해 주세요.';
  return null;
}
