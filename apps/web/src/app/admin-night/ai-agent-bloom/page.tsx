import { buildBreadcrumbJsonLd, buildPageMetadata, SITE_URL } from '@/shared/lib/seo';
import { JsonLd } from '@/shared/ui/JsonLd';
import { AdminNightBloomDetailPage } from '@/widgets/admin-night';

export const metadata = buildPageMetadata({
  title: 'AI Agent Bloom',
  description:
    'AI Agent를 같이 만들고 서로 공유해보는 오프라인 Bloom. 바이브코딩을 적극 활용해 LLM 호출에서 LangGraph, RAG fallback, 평가와 관측까지 이어갑니다.',
  path: '/admin-night/ai-agent-bloom',
  keywords: ['AI Agent', 'LangGraph', 'RAG', 'Tool Calling', 'Vibe Coding', '바이브코딩', 'Admin Night', '오프라인 모임', '수요조사'],
});

const pageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${SITE_URL}/admin-night/ai-agent-bloom#service`,
  url: `${SITE_URL}/admin-night/ai-agent-bloom`,
  name: 'AI Agent Bloom: 같이 만들고 피워보는 모임',
  description:
    'AI Agent를 같이 만들고 서로 공유해보는 오프라인 Bloom입니다. 바이브코딩을 적극 활용해 LLM 호출에서 LangGraph, RAG fallback, 평가와 관측까지 이어갑니다.',
  serviceType: '오프라인 AI Agent 개발 실습과 공유',
  provider: {
    '@type': 'Person',
    name: 'kscold',
    url: SITE_URL,
  },
  areaServed: {
    '@type': 'Country',
    name: '대한민국',
  },
};

export default function AiAgentBloomPage() {
  return (
    <>
      <JsonLd id="ai-agent-bloom-page" data={pageJsonLd} />
      <JsonLd
        id="ai-agent-bloom-breadcrumbs"
        data={buildBreadcrumbJsonLd([
          { name: 'Admin Night', path: '/admin-night' },
          { name: 'AI Agent Bloom', path: '/admin-night/ai-agent-bloom' },
        ])}
      />
      <AdminNightBloomDetailPage />
    </>
  );
}
