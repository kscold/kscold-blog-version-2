import type { Metadata } from 'next';
import {
  DEFAULT_OG_IMAGE,
  OpenGraphType,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from './constants';
import { toMetaDescription } from './text';

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
