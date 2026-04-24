const URL_REGEX = /https?:\/\/[^\s<>"'`)]+|www\.[^\s<>"'`)]+/g;

const BLOG_HOST_RE = /^https?:\/\/(?:www\.)?kscold\.com(\/.*)?$/i;
// /blog/{slug} 또는 /blog/{category}/{slug} 둘 다 지원
const BLOG_POST_RE = /^\/blog\/(?:[^/?#]+\/)?([^/?#]+)/;
const FEED_RE = /^\/feed\/([^/?#]+)/;

export type LinkifySegment =
  | { kind: 'text'; value: string }
  | { kind: 'external'; href: string; label: string }
  | { kind: 'blog-post'; href: string; slug: string }
  | { kind: 'feed'; href: string; feedId: string };

export function linkify(text: string): LinkifySegment[] {
  if (!text) return [];
  const segments: LinkifySegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(URL_REGEX)) {
    const raw = match[0];
    const start = match.index ?? 0;
    if (start > lastIndex) {
      segments.push({ kind: 'text', value: text.slice(lastIndex, start) });
    }
    const href = raw.startsWith('www.') ? `https://${raw}` : raw;
    segments.push(classifyUrl(href, raw));
    lastIndex = start + raw.length;
  }

  if (lastIndex < text.length) {
    segments.push({ kind: 'text', value: text.slice(lastIndex) });
  }

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
