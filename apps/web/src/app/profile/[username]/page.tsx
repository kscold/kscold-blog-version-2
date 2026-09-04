import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { PublicProfileContainer } from '@/widgets/profile';
import type { PublicProfile } from '@/features/profile';
import {
  absoluteUrl,
  buildBreadcrumbJsonLd,
  buildPageMetadata,
  fetchPublicApi,
  toMetaDescription,
  uniqueKeywords,
} from '@/shared/lib/seo';
import { JsonLd } from '@/shared/ui/JsonLd';

interface Props {
  params: Promise<{ username: string }>;
}

const getPublicProfile = cache((username: string) =>
  fetchPublicApi<PublicProfile>(`/users/profile/${encodeURIComponent(username)}`, 300)
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublicProfile(username);

  if (!profile) {
    notFound();
  }

  const title = `${profile.displayName} (@${profile.username})`;
  const description = toMetaDescription(
    profile.bio,
    `${profile.displayName}님의 공개 프로필과 피드입니다.`
  );

  return buildPageMetadata({
    title,
    description,
    path: `/profile/${encodeURIComponent(profile.username)}`,
    image: profile.avatar,
    keywords: uniqueKeywords([
      profile.displayName,
      profile.username,
      ...(profile.techStack || []),
    ]),
    type: 'profile',
  });
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const profile = await getPublicProfile(username);

  if (!profile) {
    notFound();
  }

  const canonicalPath = `/profile/${encodeURIComponent(profile.username)}`;
  const description = toMetaDescription(
    profile.bio,
    `${profile.displayName}님의 공개 프로필과 피드입니다.`
  );
  const profileEntity =
    profile.username === 'kscold'
      ? { '@id': `${absoluteUrl('/')}#person` }
      : {
          '@type': 'Person',
          name: profile.displayName,
          alternateName: profile.username,
          description,
          image: profile.avatar,
          knowsAbout: profile.techStack,
          sameAs: Object.values(profile.socialLinks || {}).filter(link =>
            /^https?:\/\//.test(link)
          ),
        };
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        '@id': `${absoluteUrl(canonicalPath)}#profile-page`,
        url: absoluteUrl(canonicalPath),
        name: `${profile.displayName} (@${profile.username})`,
        description,
        mainEntity: profileEntity,
        isPartOf: { '@id': `${absoluteUrl('/')}#website` },
      },
      buildBreadcrumbJsonLd([
        { name: '홈', path: '/' },
        { name: '피드', path: '/feed' },
        { name: profile.displayName, path: canonicalPath },
      ]),
    ],
  };

  return (
    <>
      <JsonLd id={`profile-${profile.username}`} data={jsonLd} />
      <PublicProfileContainer username={username} initialProfile={profile} />
    </>
  );
}

export const revalidate = 300;
