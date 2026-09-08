import { NoteDirectory } from '@/widgets/vault/directory';
import { buildBreadcrumbJsonLd, buildPageMetadata, SITE_URL } from '@/shared/lib/seo';
import { JsonLd } from '@/shared/ui/JsonLd';

export const metadata = buildPageMetadata({
  title: '김승찬의 개발 지식 노트',
  description: '백엔드·프론트엔드 개발, 데이터베이스와 AI Agent를 공부하며 정리한 김승찬의 공개 기술 노트. 제목별 목록에서 개념과 구현 기록을 찾아보세요.',
  path: '/notes',
});

export const revalidate = 300;

export default function NotesPage() {
  return (
    <>
      <JsonLd id="notes-directory" data={{
        '@context': 'https://schema.org', '@type': 'CollectionPage',
        '@id': `${SITE_URL}/notes#collection`, url: `${SITE_URL}/notes`,
        name: '김승찬의 개발 지식 노트',
        author: { '@id': `${SITE_URL}/#person` },
        isPartOf: { '@id': `${SITE_URL}/#website` },
      }} />
      <JsonLd id="notes-breadcrumb" data={buildBreadcrumbJsonLd([
        { name: '홈', path: '/' }, { name: '개발 지식 노트', path: '/notes' },
      ])} />
      <NoteDirectory />
    </>
  );
}
