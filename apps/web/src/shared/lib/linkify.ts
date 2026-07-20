const URL_REGEX = /https?:\/\/[^\s<>"'`)]+|www\.[^\s<>"'`)]+/g;

const BLOG_HOST_RE = /^https?:\/\/(?:www\.)?kscold\.com(\/.*)?$/i;
// /blog/{slug} 또는 /blog/{category}/{slug} 둘 다 지원
const BLOG_POST_RE = /^\/blog\/(?:[^/?#]+\/)?([^/?#]+)/;
const FEED_RE = /^\/feed\/([^/?#]+)/;

// 해시태그: 앞이 글자/숫자/_ 가 아니어야 하고(경계), # 뒤로 글자·숫자·_ 가 이어짐
const HASHTAG_RE = /^#([\p{L}\p{N}_]+)/u;

export type LinkifySegment =
  | { kind: 'text'; value: string }
  | { kind: 'external'; href: string; label: string }
  | { kind: 'blog-post'; href: string; slug: string }
  | { kind: 'feed'; href: string; feedId: string }
  | { kind: 'hashtag'; tag: string }
  | { kind: 'mention'; name: string; username: string };

export interface LinkifyOptions {
  /** displayName → username. @displayName 토큰을 멘션 링크로 렌더링함. */
  mentions?: Record<string, string>;
}

export function linkify(text: string, options?: LinkifyOptions): LinkifySegment[] {
  if (!text) return [];
  const segments: LinkifySegment[] = [];
  let lastIndex = 0;

  // 1차: URL 을 먼저 분리(그 안의 #, @ 는 건드리지 않는다)
  for (const match of text.matchAll(URL_REGEX)) {
    const raw = match[0];
    const start = match.index ?? 0;
    if (start > lastIndex) {
      segments.push(...tokenizeText(text.slice(lastIndex, start), options));
    }
    const href = raw.startsWith('www.') ? `https://${raw}` : raw;
    segments.push(classifyUrl(href, raw));
    lastIndex = start + raw.length;
  }

  if (lastIndex < text.length) {
    segments.push(...tokenizeText(text.slice(lastIndex), options));
  }

  return segments;
}

/** URL 이 아닌 텍스트 구간에서 #해시태그·@멘션을 추가로 분리함. */
function tokenizeText(text: string, options?: LinkifyOptions): LinkifySegment[] {
  if (!text) return [];
  const mentions = options?.mentions ?? {};
  // 긴 이름 우선(부분 매칭 방지)
  const mentionNames = Object.keys(mentions).sort((a, b) => b.length - a.length);

  const segments: LinkifySegment[] = [];
  let buffer = '';
  let i = 0;

  const isWord = (ch: string) => /[\p{L}\p{N}_]/u.test(ch);
  const flush = () => {
    if (buffer) {
      segments.push({ kind: 'text', value: buffer });
      buffer = '';
    }
  };

  while (i < text.length) {
    const ch = text[i];
    const prev = i > 0 ? text[i - 1] : '';
    const atBoundary = i === 0 || !isWord(prev);

    // 해시태그
    if (ch === '#' && atBoundary) {
      const m = HASHTAG_RE.exec(text.slice(i));
      if (m) {
        flush();
        segments.push({ kind: 'hashtag', tag: m[1] });
        i += m[0].length;
        continue;
      }
    }

    // 멘션(알려진 이름만 매칭 — 공백/한글 포함 이름도 정확히 처리)
    if (ch === '@' && atBoundary && mentionNames.length > 0) {
      const rest = text.slice(i + 1);
      const hit = mentionNames.find(name => {
        if (!rest.startsWith(name)) return false;
        const after = rest[name.length] ?? '';
        return !isWord(after); // 부분 매칭 방지
      });
      if (hit) {
        flush();
        segments.push({ kind: 'mention', name: hit, username: mentions[hit] });
        i += 1 + hit.length;
        continue;
      }
    }

    buffer += ch;
    i += 1;
  }

  flush();
  return segments;
}

function classifyUrl(href: string, label: string): LinkifySegment {
  const blogMatch = href.match(BLOG_HOST_RE);
  if (blogMatch) {
    const path = blogMatch[1] || '/';
    const post = path.match(BLOG_POST_RE);
    if (post) return { kind: 'blog-post', href, slug: decodeURIComponent(post[1]) };
    const feed = path.match(FEED_RE);
    if (feed) return { kind: 'feed', href, feedId: feed[1] };
  }
  return { kind: 'external', href, label };
}
