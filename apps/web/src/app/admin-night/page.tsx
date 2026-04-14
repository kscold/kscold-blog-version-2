import { buildPageMetadata, SITE_URL } from '@/shared/lib/seo';
import { JsonLd } from '@/shared/ui/JsonLd';
import { AdminNightPage } from '@/widgets/admin-night/ui/AdminNightPage';

export const metadata = buildPageMetadata({
  title: 'Admin Night',
  description:
    '김승찬과 함께 퇴근 후나 주말에 각자 밀린 일을 끝내고, 기록이나 PR까지 남기는 조용한 작업 문화 페이지입니다.',
  path: '/admin-night',
  keywords: ['Admin Night', '어드민 나이트', '바디 더블링', '각할모', '카공', 'PR'],
});

const adminNightJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${SITE_URL}/admin-night#page`,
  url: `${SITE_URL}/admin-night`,
  name: 'Admin Night',
  description:
    '김승찬과 함께 퇴근 후나 주말에 각자 밀린 일을 끝내고, 기록이나 PR까지 남기는 조용한 작업 문화 페이지입니다.',
  isPartOf: {
    '@id': `${SITE_URL}/#website`,
  },
};

export default function AdminNightRoutePage() {
  return (
    <>
      <JsonLd id="admin-night-page" data={adminNightJsonLd} />
      <AdminNightPage />
    </>
  );
}
