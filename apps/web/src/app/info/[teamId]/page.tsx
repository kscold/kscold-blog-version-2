import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TeamDetailPage } from '@/widgets/info';
import { BUSINESS_INFO, getTeamProfile } from '@/entities/profile';
import { buildBreadcrumbJsonLd, buildPageMetadata, SITE_URL } from '@/shared/lib/seo';
import { JsonLd } from '@/shared/ui/JsonLd';
import { AdSenseScript } from '@/shared/ui/AdSenseScript';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ teamId: string }>;
}): Promise<Metadata> {
  const { teamId } = await params;
  const team = getTeamProfile(teamId);

  if (!team) {
    return buildPageMetadata({
      title: '팀 정보를 찾을 수 없습니다',
      description: '요청한 팀 정보를 찾을 수 없습니다.',
      path: '/info',
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: team.name,
    description: team.description,
    path: `/info/${team.id}`,
    keywords: team.keywords,
  });
}

export default async function Page({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const team = getTeamProfile(teamId);

  if (!team) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': `${SITE_URL}/info/${team.id}#about`,
        url: `${SITE_URL}/info/${team.id}`,
        name: team.name,
        description: team.description,
        mainEntity: {
          '@id': `${SITE_URL}/info/${team.id}#organization`,
        },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/info/${team.id}#organization`,
        name: team.name,
        url: team.externalUrl,
        parentOrganization: {
          '@id': `${SITE_URL}/#organization`,
        },
        member: team.members.map(member => ({
          '@type': 'Person',
          name: member.name,
          jobTitle: member.position,
        })),
        address: {
          '@type': 'PostalAddress',
          streetAddress: '김포한강9로75번길 66, 5층 (구래동, 국제프라자)',
          addressLocality: '김포시',
          addressRegion: '경기도',
          addressCountry: 'KR',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          email: BUSINESS_INFO.email,
          contactType: 'customer support',
        },
      },
      buildBreadcrumbJsonLd([
        { name: '홈', path: '/' },
        { name: '소개', path: '/info' },
        { name: team.name, path: `/info/${team.id}` },
      ]),
    ],
  };

  return (
    <>
      <JsonLd id={`team-${team.id}`} data={jsonLd} />
      <AdSenseScript />
      <TeamDetailPage team={team} />
    </>
  );
}
