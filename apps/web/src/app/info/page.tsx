import { InfoContainer } from '@/widgets/info';
import { PROFILE, PROFILE_FAQ, PROFILE_IDENTITY } from '@/entities/profile';
import { buildPageMetadata, SITE_URL } from '@/shared/lib/seo';
import { JsonLd } from '@/shared/ui/JsonLd';
import { AdSenseScript } from '@/shared/ui/AdSenseScript';

export const metadata = buildPageMetadata({
  title: `김승찬(kscold) - ${PROFILE.role}`,
  // 메타 설명은 마크다운 기호(괄호 포함)를 걷어내므로 괄호 없이 쓴다.
  description: `${PROFILE.role} 김승찬 소개. ${PROFILE.bio.join(' ')}`,
  path: '/info',
  keywords: [
    '김승찬', '김승찬 개발자', '김승찬 소개', '김승찬 포트폴리오',
    '김승찬 백엔드', '김승찬 프론트엔드', '김승찬 AI Agent',
    'kscold', '콜딩', 'Colding', '프로필', '소개',
    'AI Agent 개발자', 'LangGraph', 'Python', 'MongoDB',
    '풀스택 개발자', '백엔드 개발자', '프론트엔드 개발자',
  ],
  type: 'profile',
  authors: [{ name: '김승찬', url: `${SITE_URL}/info` }],
});

const infoJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  '@id': `${SITE_URL}/info#profile-page`,
  url: `${SITE_URL}/info`,
  name: '김승찬 소개',
  description: PROFILE.bio.join(' '),
  isPartOf: {
    '@id': `${SITE_URL}/#website`,
  },
  // 소개 페이지만 읽어도 누구의 프로필인지 알 수 있게 사이트 전체 Person과 같은 @id로 핵심 정보를 함께 싣는다.
  mainEntity: {
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    name: PROFILE.name,
    ...PROFILE_IDENTITY,
    url: `${SITE_URL}/info`,
    jobTitle: PROFILE.role,
    description: PROFILE.bio[0],
  },
};

// 화면 FAQ 섹션과 동일한 내용의 FAQPage 구조화 데이터 (검색 리치결과·GEO)
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': `${SITE_URL}/info#faq`,
  mainEntity: PROFILE_FAQ.map(item => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.a,
    },
  })),
};

export default function InfoPage() {
  return (
    <>
      <JsonLd id="info-page" data={infoJsonLd} />
      <JsonLd id="info-faq" data={faqJsonLd} />
      <AdSenseScript />
      <InfoContainer />
    </>
  );
}
