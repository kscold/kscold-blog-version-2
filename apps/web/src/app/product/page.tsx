import { buildPageMetadata } from '@/shared/lib/seo';
import { ProductSalesPage } from '@/widgets/product';

export const metadata = buildPageMetadata({
  title: '판매 상품',
  description:
    '콜딩(Colding)에서 판매하는 상품 목록입니다. AI Agent Bloom 참가권을 신용카드 또는 카카오페이로 결제할 수 있습니다.',
  path: '/product',
  keywords: ['AI Agent Bloom 참가권', '상품 구매', '신용카드 결제', '카카오페이'],
});

export default function ProductPage() {
  return <ProductSalesPage />;
}
