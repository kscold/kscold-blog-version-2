import { buildBreadcrumbJsonLd, buildPageMetadata, SITE_URL } from '@/shared/lib/seo';
import { JsonLd } from '@/shared/ui/JsonLd';
import { AdminNightBloomDetailPage } from '@/widgets/admin-night/ui/bloom/AdminNightBloomDetailPage';

export const metadata = buildPageMetadata({
  title: 'AI Agent Bloom',
  description:
    '바이브코딩을 적극 활용하는 오프라인 AI Agent 어젠다 강의. LLM 호출에서 LCEL, Memory, LangGraph MAS, RAG fallback, 평가와 관측까지 이어집니다.',
  path: '/admin-night/ai-agent-bloom',
  keywords: ['AI Agent', 'LangGraph', 'RAG', 'Tool Calling', 'Vibe Coding', '바이브코딩', 'Admin Night', '오프라인 강의', '수요조사'],
});

const pageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  '@id': `${SITE_URL}/admin-night/ai-agent-bloom#event`,
  url: `${SITE_URL}/admin-night/ai-agent-bloom`,
  name: 'AI Agent Bloom: 오프라인 AI Agent 어젠다 강의',
  description:
    '바이브코딩을 적극 활용해 LLM 호출에서 LCEL, Memory, LangGraph MAS, RAG fallback, 평가와 관측까지 이어지는 오프라인 공유 강의입니다.',
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  organizer: {
    '@type': 'Person',
    name: 'kscold',
    url: SITE_URL,
  },
  isPartOf: {
    '@id': `${SITE_URL}/admin-night#page`,
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
