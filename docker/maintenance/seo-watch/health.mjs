const HTML_ENTITIES = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#x27;': "'",
  '&#39;': "'",
};

function decodeHtml(value) {
  return value.replace(/&(amp|lt|gt|quot|#x27|#39);/g, entity => HTML_ENTITIES[entity]).trim();
}

function attribute(html, pattern) {
  const match = html.match(pattern);
  return match ? decodeHtml(match[1]) : null;
}

function readJsonLdTypes(html) {
  const types = [];
  let invalid = 0;
  const blocks = html.matchAll(
    /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
  );
  for (const [, source] of blocks) {
    try {
      const data = JSON.parse(source);
      const nodes = Array.isArray(data) ? data : (data['@graph'] ?? [data]);
      for (const node of nodes) types.push(...[node?.['@type']].flat().filter(Boolean));
    } catch {
      invalid += 1;
    }
  }
  return { types: [...new Set(types)], invalid };
}

/** 검색엔진이 읽는 머리말 정보만 HTML에서 뽑는다. */
export function inspectHtml(html) {
  const jsonLd = readJsonLdTypes(html);
  return {
    title: attribute(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
    description: attribute(html, /<meta[^>]+name="description"[^>]+content="([^"]*)"/i),
    canonical: attribute(html, /<link[^>]+rel="canonical"[^>]+href="([^"]*)"/i),
    robots: attribute(html, /<meta[^>]+name="robots"[^>]+content="([^"]*)"/i),
    h1Count: (html.match(/<h1[\s>]/gi) ?? []).length,
    jsonLdTypes: jsonLd.types,
    invalidJsonLd: jsonLd.invalid,
  };
}

const sameUrl = (left, right) => left.replace(/\/$/, '') === right.replace(/\/$/, '');

/** 색인 대상 화면이 갖춰야 할 조건을 확인하고, 어긋난 점만 사람이 읽을 문장으로 돌려준다. */
export function findPageProblems({ url, status, html }) {
  if (status !== 200) return [`HTTP ${status}`];
  const page = inspectHtml(html);
  const problems = [];
  if (!page.title) problems.push('title 없음');
  if (!page.description) problems.push('description 없음');
  if (!page.canonical) problems.push('canonical 없음');
  else if (!sameUrl(page.canonical, url)) problems.push(`canonical 불일치(${page.canonical})`);
  if (/noindex/i.test(page.robots ?? '')) problems.push('noindex인데 색인 대상에 포함됨');
  if (page.h1Count !== 1) problems.push(`h1 ${page.h1Count}개`);
  if (page.invalidJsonLd > 0) problems.push('구조화 데이터(JSON-LD) 파싱 실패');
  if (page.jsonLdTypes.length === 0) problems.push('구조화 데이터 없음');
  return problems;
}

const TEXT_RULES = {
  'robots.txt': body => (/^sitemap:/im.test(body) ? null : 'Sitemap 줄 없음'),
  'sitemap.xml': body => (/<loc>/.test(body) ? null : 'URL 없음'),
  'rss.xml': body => (/<item>/.test(body) ? null : '항목 없음'),
  'ads.txt': body => (/^google\.com,\s*pub-\d+,\s*DIRECT/im.test(body) ? null : '게시자 줄 없음'),
  'llms.txt': body => (body.trim().length > 0 ? null : '내용 없음'),
};

/** robots·사이트맵·ads.txt 같은 텍스트 파일이 살아 있고 핵심 줄을 담고 있는지 확인한다. */
export function findFileProblems({ name, status, body }) {
  if (status !== 200) return [`HTTP ${status}`];
  const problem = TEXT_RULES[name]?.(body);
  return problem ? [problem] : [];
}
