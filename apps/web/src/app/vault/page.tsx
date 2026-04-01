import { Suspense } from 'react';
import { VaultGraphLayout } from '@/widgets/vault/ui/VaultGraphLayout';
import { buildPageMetadata, SITE_URL } from '@/shared/lib/seo';
import { JsonLd } from '@/shared/ui/JsonLd';

export const metadata = buildPageMetadata({
  title: 'Vault 노트',
  description: '연결된 메모와 지식 그래프로 정리한 개인 Vault 공간입니다.',
  path: '/vault',
  keywords: ['Vault', '지식 그래프', '개인 위키', '개발 메모'],
});

const vaultJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${SITE_URL}/vault#collection`,
  url: `${SITE_URL}/vault`,
  name: 'Vault 노트',
  description: '연결된 메모와 지식 그래프로 정리한 개인 Vault 공간입니다.',
  isPartOf: {
    '@id': `${SITE_URL}/#website`,
  },
};

export default function VaultIndexPage() {
  return (
    <>
      <JsonLd id="vault-page" data={vaultJsonLd} />
      <Suspense>
        <VaultGraphLayout />
      </Suspense>
    </>
  );
}
