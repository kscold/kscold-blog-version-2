import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache, Suspense } from 'react';
import type { VaultNote } from '@/shared/model/types/vault';
import { VaultNoteLayout } from '@/widgets/vault/note';
import {
  absoluteUrl,
  buildBreadcrumbJsonLd,
  buildPageMetadata,
  fetchPublicApi,
  isIndexableVaultContent,
  toMetaDescription,
  uniqueKeywords,
} from '@/shared/lib/seo';
import { JsonLd } from '@/shared/ui/JsonLd';
import { VaultNotePageSkeleton } from '@/shared/ui/RouteSkeletons';

const getVaultNote = cache((slug: string) =>
  fetchPublicApi<VaultNote>(`/vault/notes/slug/${slug}`)
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const note = await getVaultNote(slug);

  if (!note) {
    notFound();
  }

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
    authors: [{ name: note.author.name }],
    noIndex: isThinNote,
  });
}

export default async function VaultNotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const note = await getVaultNote(slug);

  if (!note) {
    notFound();
  }

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
        datePublished: note.createdAt,
        dateModified: note.updatedAt,
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
      <Suspense fallback={<VaultNotePageSkeleton />}>
        <VaultNoteLayout slug={note.slug} initialNote={note} />
      </Suspense>
    </>
  );
}

export const revalidate = 3600;
