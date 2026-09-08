import type { Metadata } from 'next';
import {
  DEFAULT_OG_IMAGE,
  OpenGraphType,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from './constants';
import { toMetaDescription } from './text';
import { toSeoDateTime } from './date';

const DEFAULT_SOCIAL_IMAGE_ALT =
  'KSCOLD 로고와 AI Agent, Backend, Full-stack 문구가 있는 김승찬 기술 블로그 공유 카드';

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

export function absoluteUrl(path = '/') {
  const normalizedPath = `/${path.replace(/^\/+/, '')}`;
  return new URL(normalizedPath, SITE_URL).toString();
}

export function toOgImage(image?: string | null) {
  if (!image) {
    return absoluteUrl(DEFAULT_OG_IMAGE);
  }

  try {
    const resolved = new URL(image, SITE_URL);
    return resolved.protocol === 'https:' ? resolved.toString() : absoluteUrl(DEFAULT_OG_IMAGE);
  } catch {
    return absoluteUrl(DEFAULT_OG_IMAGE);
  }
}

export function buildSocialImage(image: string | null | undefined, alt: string) {
  const url = toOgImage(image);
  const isDefaultImage = url === absoluteUrl(DEFAULT_OG_IMAGE);

  return {
    url,
    alt: isDefaultImage ? DEFAULT_SOCIAL_IMAGE_ALT : alt,
    ...(isDefaultImage ? { width: 1200, height: 630, type: 'image/png' } : {}),
  };
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
  const metaDescription = toMetaDescription(description, SITE_DESCRIPTION);
  const socialImage = buildSocialImage(image, title);

  return {
    title,
    description: metaDescription,
    keywords: keywords.length > 0 ? keywords : undefined,
    authors,
    alternates: {
      canonical,
      types: {
        'application/rss+xml': `${SITE_URL}/rss.xml`,
      },
    },
    openGraph: {
      title,
      description: metaDescription,
      url: canonical,
      siteName: SITE_NAME,
      locale: 'ko_KR',
      type,
      images: [socialImage],
      ...(publishedTime ? { publishedTime: toSeoDateTime(publishedTime) } : {}),
      ...(modifiedTime ? { modifiedTime: toSeoDateTime(modifiedTime) } : {}),
      ...(authors?.length ? { authors: authors.map(author => author.name) } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: metaDescription,
      images: [socialImage],
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
