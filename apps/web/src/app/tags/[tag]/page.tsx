import type { Metadata } from 'next';
import { buildPageMetadata } from '@/shared/lib/seo';
import { UnifiedTagContainer } from '@/widgets/blog/ui/UnifiedTagContainer';

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
