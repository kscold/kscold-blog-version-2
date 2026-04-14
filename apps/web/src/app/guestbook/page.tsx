import { GuestbookPageClient } from '@/widgets/guestbook/ui/GuestbookPageClient';
import { buildPageMetadata, SITE_URL } from '@/shared/lib/seo';
import { JsonLd } from '@/shared/ui/JsonLd';

export const metadata = buildPageMetadata({
  title: '방명록',
  description: '블로그를 읽고 떠오른 생각, 인사, 간단한 버그 제보와 피드백을 남기는 KSCOLD 블로그 방명록입니다.',
  path: '/guestbook',
  keywords: ['방명록', '김승찬 블로그', 'KSCOLD', '콜딩'],
});

const guestbookJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${SITE_URL}/guestbook#collection`,
  url: `${SITE_URL}/guestbook`,
  name: 'KSCOLD 방명록',
  description: '블로그를 읽고 떠오른 생각, 인사, 간단한 버그 제보와 피드백을 남기는 KSCOLD 블로그 방명록입니다.',
  isPartOf: {
    '@id': `${SITE_URL}/#website`,
  },
};

export default function GuestbookPage() {
  return (
    <>
      <JsonLd id="guestbook-page" data={guestbookJsonLd} />
      <GuestbookPageClient />
    </>
  );
}
