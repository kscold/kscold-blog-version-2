import { InfoContainer } from '@/widgets/info/ui/InfoContainer';
import { PROFILE } from '@/entities/profile/model/profileData';
import { buildPageMetadata, SITE_URL } from '@/shared/lib/seo';
import { JsonLd } from '@/shared/ui/JsonLd';

export const metadata = buildPageMetadata({
  title: '소개',
  description: PROFILE.bio.join(' '),
  path: '/info',
  keywords: ['김승찬', 'kscold', 'Colding', '프로필', '소개'],
  type: 'profile',
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
