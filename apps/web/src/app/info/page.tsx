import { InfoContainer } from '@/widgets/info/ui/InfoContainer';
import { PROFILE } from '@/entities/profile/model/profileData';
import { buildPageMetadata, SITE_URL } from '@/shared/lib/seo';
import { JsonLd } from '@/shared/ui/JsonLd';

export const metadata = buildPageMetadata({
  title: '소개 | 개발자 김승찬(kscold)',
  description: `개발자 김승찬(kscold). ${PROFILE.bio.join(' ')}`,
  path: '/info',
  keywords: [
    '김승찬', '김승찬 개발자', '김승찬 소개', '김승찬 포트폴리오',
    'kscold', '콜딩', 'Colding', '프로필', '소개',
    '풀스택 개발자', '백엔드 개발자', '프론트엔드 개발자',
  ],
  type: 'profile',
  authors: [{ name: '김승찬', url: 'https://github.com/kscold' }],
});

const infoJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  '@id': `${SITE_URL}/info#profile-page`,
  url: `${SITE_URL}/info`,
  name: '김승찬 소개',
  description: PROFILE.bio.join(' '),
  mainEntity: {
    '@id': `${SITE_URL}/#person`,
  },
};

export default function InfoPage() {
  return (
    <>
      <JsonLd id="info-page" data={infoJsonLd} />
      <InfoContainer />
    </>
  );
}
