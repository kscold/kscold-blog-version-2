import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { cache } from 'react';
import { PostDetail } from '@/widgets/post';
import type { Post } from '@/shared/model/types/blog';
import type { PageResponse } from '@/shared/model/types/api';
import {
  absoluteUrl,
  buildBreadcrumbJsonLd,
  buildPageMetadata,
  fetchPublicApi,
  fetchViewerApi,
  RECENT_DETAIL_PRERENDER_COUNT,
  toMetaDescription,
  toOgImage,
  uniqueKeywords,
} from '@/shared/lib/seo';
import { JsonLd } from '@/shared/ui/JsonLd';
import { AdSenseScript } from '@/shared/ui/AdSenseScript';

export async function generateStaticParams() {
  const posts = await fetchPublicApi<PageResponse<Post>>(
    `/posts?page=0&size=${RECENT_DETAIL_PRERENDER_COUNT}`
  );

  return (posts?.content ?? [])
    .filter(post => post.status === 'PUBLISHED' && !post.restricted)
    .map(post => ({ category: post.category.slug, slug: post.slug }));
}

const getPost = cache(async (slug: string): Promise<Post | null> => {
  const encodedSlug = encodeURIComponent(slug);
  const publicPost = await fetchPublicApi<Post>(`/posts/slug/${encodedSlug}`, 300);

  if (publicPost?.status === 'PUBLISHED' && !publicPost.restricted) {
    return publicPost;
  }

  const viewerPost = await fetchViewerApi<Post>(`/posts/slug/${encodedSlug}`);
  const post = viewerPost || publicPost;
  if (!post || post.status === 'PUBLISHED') {
    return post;
  }

  // 공개 API가 초안을 잘못 반환하는 이전 백엔드와의 배포 시차에도 관리자만 미리볼 수 있게 방어한다.
  const viewer = await fetchViewerApi<{ role: string }>('/auth/me');
  return viewer?.role === 'ADMIN' ? post : null;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const title = post.seo?.metaTitle || post.title;
  const description = toMetaDescription(post.seo?.metaDescription || post.excerpt || post.content);
  const keywords = uniqueKeywords([...(post.seo?.keywords || []), ...post.tags.map(tag => tag.name), post.category.name]);

  return buildPageMetadata({
    title,
    description,
    path: `/blog/${post.category.slug}/${post.slug}`,
    keywords,
    type: 'article',
    image: post.coverImage,
    publishedTime: post.publishedAt || post.createdAt,
    modifiedTime: post.updatedAt,
    authors: [{ name: post.author.name }],
    noIndex: Boolean(post.restricted),
  });
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  if (category !== post.category.slug) {
    redirect(`/blog/${post.category.slug}/${post.slug}`);
  }

  const description = toMetaDescription(post.seo?.metaDescription || post.excerpt || post.content);
  const canonicalPath = `/blog/${post.category.slug}/${post.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${absoluteUrl(canonicalPath)}#article`,
        headline: post.title,
        description,
        url: absoluteUrl(canonicalPath),
        image: [toOgImage(post.coverImage)],
        datePublished: post.publishedAt || post.createdAt,
        dateModified: post.updatedAt,
        articleSection: post.category.name,
        keywords: uniqueKeywords([...(post.seo?.keywords || []), ...post.tags.map(tag => tag.name)]).join(', '),
        isAccessibleForFree: !post.restricted,
        author: { '@id': `${absoluteUrl('/')}#person` },
        publisher: {
          '@type': 'Organization',
          '@id': `${absoluteUrl('/')}#organization`,
        },
        mainEntityOfPage: absoluteUrl(canonicalPath),
      },
      buildBreadcrumbJsonLd([
        { name: '홈', path: '/' },
        { name: '블로그', path: '/blog' },
        { name: post.category.name, path: `/blog/${post.category.slug}` },
        { name: post.title, path: canonicalPath },
      ]),
    ],
  };

  return (
    <>
      <JsonLd id={`post-${post.id}`} data={jsonLd} />
      <AdSenseScript />
      <PostDetail post={post} />
    </>
  );
}

export const revalidate = 300;
