import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TeamDetailPage } from '@/widgets/info/ui/TeamDetailPage';
import { BUSINESS_INFO, TEAM_MEMBERS } from '@/entities/profile/model/teamData';
import { buildBreadcrumbJsonLd, buildPageMetadata, SITE_URL } from '@/shared/lib/seo';
import { JsonLd } from '@/shared/ui/JsonLd';

function getTeamPageData(teamId: string) {
  if (teamId !== 'pawpong') {
    return null;
  }

  return {
    id: 'pawpong',
    name: 'Pawpong Team',
    description: '반려동물 플랫폼 Pawpong 팀과 콜딩의 협업 구조, 팀 구성, 사업 정보를 소개합니다.',
    externalUrl: 'https://pawpong.kr',
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ teamId: string }>;
}): Promise<Metadata> {
  const { teamId } = await params;
  const team = getTeamPageData(teamId);

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
    keywords: ['Pawpong', 'Colding', '팀 소개', '반려동물 플랫폼'],
  });
}

export default async function Page({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const team = getTeamPageData(teamId);

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
        member: TEAM_MEMBERS.map(member => ({
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
      <TeamDetailPage teamId={team.id} />
    </>
  );
}
