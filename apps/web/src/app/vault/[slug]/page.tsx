import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { cache, Suspense } from 'react';
import {
  buildVaultTitleSlugMap,
  extractVaultWikiLinkTitles,
  findCurrentVaultSlug,
} from '@/entities/vault';
import type { VaultNote, VaultNoteTitle } from '@/shared/model/types/vault';
import { VaultNoteLayout } from '@/widgets/vault/note';
import {
  absoluteUrl,
  buildBreadcrumbJsonLd,
  buildPageMetadata,
  fetchPublicApi,
  isIndexableVaultContent,
  toMetaDescription,
  toSeoDateTime,
  uniqueKeywords,
} from '@/shared/lib/seo';
import { AdSenseScript } from '@/shared/ui/AdSenseScript';
import { JsonLd } from '@/shared/ui/JsonLd';
import { VaultNotePageSkeleton } from '@/shared/ui/RouteSkeletons';

const getVaultNote = cache((slug: string) =>
  fetchPublicApi<VaultNote>(`/vault/notes/slug/${slug}`)
);

const getVaultTitleIndex = cache(async () => {
  try {
    return (await fetchPublicApi<VaultNoteTitle[]>('/vault/notes/title-index')) ?? [];
  } catch {
    return [];
  }
});

function decodeSlug(slug: string) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

/** 노트를 찾는다. 없으면 예전 주소 체계의 주소인지 확인해 현재 주소로 보내고, 아니면 404로 끝낸다. */
async function requireVaultNote(slug: string): Promise<VaultNote> {
  const note = await getVaultNote(slug);
  if (note) {
    return note;
  }

  const currentSlug = findCurrentVaultSlug(decodeSlug(slug), await getVaultTitleIndex());
  if (currentSlug) {
    permanentRedirect(`/vault/${encodeURIComponent(currentSlug)}`);
  }
  notFound();
}

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const note = await requireVaultNote(slug);

  // 분량이 적은 노트(용어 스텁 등)는 색인에서 제외한다. 사이트맵 필터와 동일한 기준을 공유해
  // "색인해달라(sitemap) + 색인하지 마라(noindex)" 가 충돌하지 않도록 한다.
  const isThinNote = !isIndexableVaultContent(note.content);

  return buildPageMetadata({
    title: `${note.title} | Vault`,
    description: toMetaDescription(note.content, note.title),
    path: `/vault/${note.slug}`,
    keywords: uniqueKeywords([note.title, ...note.tags, 'Vault', '지식 관리']),
    type: 'article',
    publishedTime: note.createdAt,
    modifiedTime: note.updatedAt,
    authors: [{ name: note.author.name, url: absoluteUrl('/info') }],
    noIndex: isThinNote,
  });
}

export default async function VaultNotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const note = await requireVaultNote(slug);

  const titleIndex = await getVaultTitleIndex();
  const referencedTitles = extractVaultWikiLinkTitles(note.content);
  const initialTitleSlugMap = buildVaultTitleSlugMap(titleIndex, referencedTitles);

  const canonicalPath = `/vault/${note.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TechArticle',
        '@id': `${absoluteUrl(canonicalPath)}#article`,
        url: absoluteUrl(canonicalPath),
        headline: note.title,
        description: toMetaDescription(note.content, note.title),
        datePublished: toSeoDateTime(note.createdAt),
        dateModified: toSeoDateTime(note.updatedAt),
        keywords: uniqueKeywords([note.title, ...note.tags]).join(', '),
        author: { '@id': `${absoluteUrl('/')}#person` },
        mainEntityOfPage: absoluteUrl(canonicalPath),
      },
      buildBreadcrumbJsonLd([
        { name: '홈', path: '/' },
        { name: 'Vault', path: '/vault' },
        { name: note.title, path: canonicalPath },
      ]),
    ],
  };

  return (
    <>
      <JsonLd id={`vault-${note.id}`} data={jsonLd} />
      {/* 용어 스텁처럼 분량이 적은 노트는 색인에서 빼는 것과 같은 기준으로 광고도 붙이지 않는다. */}
      {isIndexableVaultContent(note.content) && <AdSenseScript />}
      <Suspense fallback={<VaultNotePageSkeleton />}>
        <VaultNoteLayout
          slug={note.slug}
          initialNote={note}
          initialTitleSlugMap={initialTitleSlugMap}
        />
      </Suspense>
    </>
  );
}

export const revalidate = 3600;
