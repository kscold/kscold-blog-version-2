import { buildPageMetadata, SITE_URL } from '@/shared/lib/seo';
import { JsonLd } from '@/shared/ui/JsonLd';
import { AdminNightPage } from '@/widgets/admin-night/ui/AdminNightPage';

export const metadata = buildPageMetadata({
  title: 'Admin Night',
  description:
    '퇴근 후 각자 할 일을 끝내는 각할모 공간, Admin Night. 참여 PR을 보내고 승인되면 merge / meet 흐름으로 실제 만남 일정이 이어집니다.',
  path: '/admin-night',
  keywords: ['Admin Night', '어드민 나이트', '바디 더블링', '각할모', '만남', 'PR'],
});

const adminNightJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${SITE_URL}/admin-night#page`,
  url: `${SITE_URL}/admin-night`,
  name: 'Admin Night',
  description:
    '퇴근 후 각자 할 일을 끝내는 각할모 공간, Admin Night. 참여 PR을 보내고 승인되면 merge / meet 흐름으로 실제 만남 일정이 이어집니다.',
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
