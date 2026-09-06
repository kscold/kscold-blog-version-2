import type { VaultNoteTitle } from '@/shared/model/types/vault';

const WIKI_LINK_PATTERN = /\[\[([^|\]]+)(?:\|[^\]]+)?\]\]/g;
const CALLOUT_TYPE_LABELS: Record<string, string> = {
  NOTE: '참고',
  TIP: '팁',
  INFO: '정보',
  IMPORTANT: '중요',
  WARNING: '주의',
  CAUTION: '주의',
  DANGER: '위험',
  BUG: '버그',
  EXAMPLE: '예시',
  QUOTE: '인용',
  SUMMARY: '요약',
  ABSTRACT: '요약',
};

export function extractVaultWikiLinkTitles(content: string): Set<string> {
  const titles = new Set<string>();

  for (const match of content.matchAll(WIKI_LINK_PATTERN)) {
    if (match.index !== undefined && content[match.index - 1] === '!') {
      continue;
    }

    const title = match[1].trim();
    if (title) {
      titles.add(title);
    }
  }

  return titles;
}

export function buildVaultTitleSlugMap(
  titleIndex: readonly VaultNoteTitle[],
  referencedTitles?: ReadonlySet<string>
): Record<string, string> {
  const entries = new Map<string, string>();

  for (const item of titleIndex) {
    if (item.name && item.slug && (!referencedTitles || referencedTitles.has(item.name))) {
      entries.set(item.name, item.slug);
    }
  }

  return Object.fromEntries(entries);
}

function getMappedSlug(titleSlugMap: Record<string, string>, title: string) {
  if (!Object.hasOwn(titleSlugMap, title)) {
    return undefined;
  }

  const slug = titleSlugMap[title];
  return typeof slug === 'string' && slug ? slug : undefined;
}

export function processVaultNoteContent(
  rawContent: string,
  titleSlugMap: Record<string, string> = {}
): string {
  let content = rawContent.replace(/^---[\s\S]*?---\n?/, '');

  content = content.replace(/^> \[!(\w+)\]\+?\s*(.*?)$/gm, (_, type, title) => {
    const label = CALLOUT_TYPE_LABELS[type.toUpperCase()] ?? type;
    return title.trim() ? `> **[${label}]** ${title.trim()}` : `> **[${label}]**`;
  });
  content = content.replace(/==([^=\n]+)==/g, '**$1**');
  content = content.replace(
    /!\[\[([^\]]+\.(png|jpg|jpeg|gif|webp|svg))\]\]/gi,
    (_, filename) => `![${filename}](${filename})`
  );
  content = content.replace(/!\[\[([^\]]+)\]\]/g, '');
  content = content.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, (_, link, display) => {
    const slug = getMappedSlug(titleSlugMap, link.trim());
    return slug ? `[**${display}**](/vault/${slug})` : `**${display}**`;
  });
  content = content.replace(/\[\[([^\]]+)\]\]/g, (_, title) => {
    const slug = getMappedSlug(titleSlugMap, title.trim());
    return slug ? `[**${title}**](/vault/${slug})` : `**${title}**`;
  });

  return content;
}
