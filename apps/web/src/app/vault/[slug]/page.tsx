import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { VaultNote } from '@/types/vault';
import { VaultNoteLayout } from '@/widgets/vault/ui/VaultNoteLayout';
import {
  absoluteUrl,
  buildBreadcrumbJsonLd,
  buildPageMetadata,
  fetchPublicApi,
  toMetaDescription,
  uniqueKeywords,
} from '@/shared/lib/seo';
import { JsonLd } from '@/shared/ui/JsonLd';

async function getVaultNote(slug: string) {
  return fetchPublicApi<VaultNote>(`/vault/notes/slug/${slug}`);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const note = await getVaultNote(slug);

  if (!note) {
    return buildPageMetadata({
      title: '노트를 찾을 수 없습니다',
      description: '요청한 Vault 노트를 찾을 수 없습니다.',
      path: '/vault',
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: `${note.title} | Vault`,
    description: toMetaDescription(note.content, note.title),
    path: `/vault/${note.slug}`,
    keywords: uniqueKeywords([note.title, ...note.tags, 'Vault', '지식 관리']),
    type: 'article',
    publishedTime: note.createdAt,
    modifiedTime: note.updatedAt,
    authors: [{ name: note.author.name }],
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
        articleBody: toMetaDescription(note.content, note.title, 320),
        datePublished: note.createdAt,
        dateModified: note.updatedAt,
        keywords: uniqueKeywords([note.title, ...note.tags]).join(', '),
        author: {
          '@type': 'Person',
          name: note.author.name,
          url: absoluteUrl('/info'),
        },
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
      <VaultNoteLayout slug={note.slug} />
    </>
  );
}

export const revalidate = 3600;
