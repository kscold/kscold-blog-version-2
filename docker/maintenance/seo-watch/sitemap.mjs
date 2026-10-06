const XML_ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'" };

function decodeXml(value) {
  return value.replace(/&(amp|lt|gt|quot|apos);/g, entity => XML_ENTITIES[entity]);
}

const withoutTrailingSlash = url => url.replace(/\/$/, '');

/** 사이트맵 XML에서 URL과 수정 시각을 뽑는다. 색인 요청 대상을 고르는 기준이 된다. */
export function parseSitemap(xml) {
  const entries = [];
  for (const block of xml.match(/<url>[\s\S]*?<\/url>/g) ?? []) {
    const loc = block.match(/<loc>\s*([^<\s]+)\s*<\/loc>/)?.[1];
    if (!loc) continue;
    const lastmod = block.match(/<lastmod>\s*([^<\s]+)\s*<\/lastmod>/)?.[1] ?? '';
    entries.push({ loc: decodeXml(loc), lastmod });
  }
  return entries;
}

/**
 * 지난번에 알린 뒤로 새로 생겼거나 수정 시각이 달라진 URL만 색인 요청 대상으로 고른다.
 * 바뀌지 않은 URL을 되풀이해 보내면 검색엔진이 요청을 무시하기 시작하므로 변경분만 보낸다.
 */
export function planIndexNow(entries, submitted = {}) {
  const changed = entries.filter(entry => submitted[entry.loc] !== entry.lastmod);
  if (changed.length === 0) return { changed, urls: [] };

  // 상세 글이 바뀌면 그 글을 나열하는 목록 화면도 달라졌으므로 함께 다시 알린다.
  const hubs = new Set();
  for (const { loc } of changed) {
    const { origin, pathname } = new URL(loc);
    const section = pathname.split('/')[1];
    hubs.add(withoutTrailingSlash(origin));
    if (section) hubs.add(`${origin}/${section}`);
  }
  const listed = entries
    .filter(entry => hubs.has(withoutTrailingSlash(entry.loc)))
    .map(entry => entry.loc);
  return { changed, urls: [...new Set([...changed.map(entry => entry.loc), ...listed])] };
}

/** 이번 사이트맵 기준으로 "알린 상태"를 다시 만든다. 사이트맵에서 빠진 URL은 함께 잊는다. */
export function toSubmittedState(entries) {
  return Object.fromEntries(entries.map(entry => [entry.loc, entry.lastmod]));
}
