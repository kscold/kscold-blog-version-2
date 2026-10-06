import { Suspense } from 'react';
import { VaultGraphLayout } from '@/widgets/vault/graph';
import { buildPageMetadata, SITE_URL } from '@/shared/lib/seo';
import { JsonLd } from '@/shared/ui/JsonLd';
import { VaultIndexPageSkeleton } from '@/shared/ui/RouteSkeletons';

const VAULT_DESCRIPTION =
  '개발자 김승찬이 공부하며 쌓은 공개 노트를 지식 그래프로 탐색하는 Vault입니다. 백엔드·프론트엔드·데이터베이스·AI Agent 노트가 서로 연결되어 있어 관련 개념을 따라가며 읽을 수 있습니다.';

export const metadata = buildPageMetadata({
  title: 'Vault 노트',
  description: VAULT_DESCRIPTION,
  path: '/vault',
  keywords: ['Vault', '지식 그래프', '개인 위키', '개발 메모'],
});

const vaultJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${SITE_URL}/vault#collection`,
  url: `${SITE_URL}/vault`,
  name: 'Vault 노트',
  description: VAULT_DESCRIPTION,
  isPartOf: {
    '@id': `${SITE_URL}/#website`,
  },
};

export default function VaultIndexPage() {
  return (
    <>
      <h1 className="sr-only">KSCOLD Vault 지식 그래프</h1>
      <JsonLd id="vault-page" data={vaultJsonLd} />
      <Suspense fallback={<VaultIndexPageSkeleton />}>
        <VaultGraphLayout />
      </Suspense>
    </>
  );
}
