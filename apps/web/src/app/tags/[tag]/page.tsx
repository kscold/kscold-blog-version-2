import type { Metadata } from 'next';
import { buildPageMetadata } from '@/shared/lib/seo';
import { UnifiedTagContainer } from '@/widgets/blog';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  return buildPageMetadata({
    title: `#${decodedTag}`,
    description: `${decodedTag} 태그로 묶인 블로그 포스트와 피드 모음입니다.`,
    path: `/tags/${encodeURIComponent(decodedTag)}`,
    keywords: [decodedTag, '태그', '블로그', '피드'],
    // 이 통합 태그 라우트는 콘텐츠가 비어 있을 수 있고 /blog/tags/[slug](사이트맵
    // 등록된 정식 태그 페이지)와 중복되므로 색인하지 않는다. 빈/얇은 태그 페이지가
    // 색인되어 품질 평가에 악영향을 주는 것을 막음.
    noIndex: true,
  });
}

export default async function UnifiedTagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  return <UnifiedTagContainer tagName={decodedTag} />;
}

export const dynamic = 'force-dynamic';
