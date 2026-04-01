import type { Metadata } from 'next';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://kscold.com/api';

export const SITE_URL = 'https://kscold.com';
export const SITE_NAME = '김승찬 블로그';
export const SITE_DESCRIPTION =
  '콜딩(Colding)에서 제품을 만들고 운영하는 김승찬의 개인 기술 블로그. 개발 기록, 실험, 피드, Vault 노트를 연결합니다.';
export const DEFAULT_OG_IMAGE = '/apple-touch-icon.png';

type OpenGraphType = 'website' | 'article' | 'book' | 'profile' | 'music.song' | 'music.album' | 'music.playlist' | 'music.radio_station' | 'video.movie' | 'video.episode' | 'video.tv_show' | 'video.other';

interface BuildPageMetadataInput {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  type?: OpenGraphType;
  image?: string | null;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: { name: string; url?: string }[];
  noIndex?: boolean;
}

export async function fetchPublicApi<T>(path: string, revalidate = 3600): Promise<T | null> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const requestUrl = `${API_BASE_URL}${normalizedPath}`;

  try {
    const response = await fetch(requestUrl, {
      next: { revalidate },
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    return (payload?.data ?? payload) as T;
  } catch (error) {
    console.error(`Failed to fetch public API: ${requestUrl}`, error);
    return null;
  }
}

export function absoluteUrl(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalizedPath, SITE_URL).toString();
}

export function toOgImage(image?: string | null) {
  if (!image) {
    return absoluteUrl(DEFAULT_OG_IMAGE);
  }

  try {
    return new URL(image, SITE_URL).toString();
  } catch {
    return absoluteUrl(DEFAULT_OG_IMAGE);
  }
}

export function stripRichText(input: string) {
  return input
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[\[([^\]|]+)(\|[^\]]+)?]]/g, '$1')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[>*_~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function toMetaDescription(input?: string | null, fallback = SITE_DESCRIPTION, maxLength = 160) {
  const cleaned = input ? stripRichText(input) : '';
  const base = cleaned || fallback;

  if (base.length <= maxLength) {
    return base;
  }

  return `${base.slice(0, maxLength - 3).trim()}...`;
}

export function uniqueKeywords(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values
        .map(value => value?.trim())
        .filter((value): value is string => Boolean(value))
    )
  );
}

export function buildPageMetadata({
  title,
  description,
  path,
  keywords = [],
  type = 'website',
  image,
  publishedTime,
  modifiedTime,
  authors,
  noIndex = false,
}: BuildPageMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const metaDescription = toMetaDescription(description);
  const ogImage = toOgImage(image);

  return {
    title,
    description: metaDescription,
    keywords: keywords.length > 0 ? keywords : undefined,
    authors,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description: metaDescription,
      url: canonical,
      siteName: SITE_NAME,
      locale: 'ko_KR',
      type,
      images: [
        {
          url: ogImage,
          alt: title,
        },
      ],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
      ...(authors?.length ? { authors: authors.map(author => author.name) } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: metaDescription,
      images: [ogImage],
    },
    ...(noIndex
      ? {
          robots: {
            index: false,
            follow: false,
            nocache: true,
            googleBot: {
              index: false,
              follow: false,
              noimageindex: true,
              'max-image-preview': 'none' as const,
              'max-snippet': -1,
            },
          },
        }
      : {}),
  };
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function flattenCategories<T extends { children?: T[] }>(items: T[]): T[] {
  return items.flatMap(item => [item, ...flattenCategories(item.children || [])]);
}
