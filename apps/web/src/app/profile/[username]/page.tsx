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

function getProfileName(profile: PublicProfile) {
  return profile.username === 'kscold' ? '김승찬' : profile.displayName;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublicProfile(username);

  if (!profile) {
    notFound();
  }

  const profileName = getProfileName(profile);
  const title = `${profileName} (@${profile.username})`;
  const description = toMetaDescription(
    profile.bio,
    `${profileName}님의 공개 프로필과 피드입니다.`
  );

  return buildPageMetadata({
    title,
    description,
    path: `/profile/${encodeURIComponent(profile.username)}`,
    image: profile.avatar,
    keywords: uniqueKeywords([
      profileName,
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
  const profileName = getProfileName(profile);
  const description = toMetaDescription(
    profile.bio,
    `${profileName}님의 공개 프로필과 피드입니다.`
  );
  const profileEntity =
    profile.username === 'kscold'
      ? { '@id': `${absoluteUrl('/')}#person` }
      : {
          '@type': 'Person',
          name: profileName,
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
        name: `${profileName} (@${profile.username})`,
        description,
        mainEntity: profileEntity,
        isPartOf: { '@id': `${absoluteUrl('/')}#website` },
      },
      buildBreadcrumbJsonLd([
        { name: '홈', path: '/' },
        { name: '피드', path: '/feed' },
        { name: profileName, path: canonicalPath },
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
