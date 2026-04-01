import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { PostDetail } from '@/widgets/post/ui/PostDetail';
import type { Post } from '@/types/blog';
import type { PageResponse } from '@/types/api';
import {
  absoluteUrl,
  buildBreadcrumbJsonLd,
  buildPageMetadata,
  fetchPublicApi,
  toMetaDescription,
  toOgImage,
  uniqueKeywords,
} from '@/shared/lib/seo';
import { JsonLd } from '@/shared/ui/JsonLd';

async function getPost(slug: string) {
  return fetchPublicApi<Post>(`/posts/slug/${slug}`);
}

async function getAllPosts() {
  const page = await fetchPublicApi<PageResponse<Post>>('/posts?size=1000');
  return page?.content || [];
}

export async function generateStaticParams() {
  const posts = await getAllPosts();

  return posts
    .filter(post => post.status === 'PUBLISHED')
    .map(post => ({
      category: post.category.slug,
      slug: post.slug,
    }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post || post.status !== 'PUBLISHED') {
    return buildPageMetadata({
      title: '포스트를 찾을 수 없습니다',
      description: '요청한 포스트를 찾을 수 없습니다.',
      path: '/blog',
      noIndex: true,
    });
  }

  const title = post.seo?.metaTitle || post.title;
  const description = post.seo?.metaDescription || post.excerpt || toMetaDescription(post.content);
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

  if (!post || post.status !== 'PUBLISHED') {
    notFound();
  }

  if (category !== post.category.slug) {
    redirect(`/blog/${post.category.slug}/${post.slug}`);
  }

  const description = post.seo?.metaDescription || post.excerpt || toMetaDescription(post.content);
  const canonicalPath = `/blog/${post.category.slug}/${post.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${absoluteUrl(canonicalPath)}#article`,
        headline: post.title,
        description,
        articleBody: toMetaDescription(post.content, post.excerpt, 320),
        url: absoluteUrl(canonicalPath),
        image: [toOgImage(post.coverImage)],
        datePublished: post.publishedAt || post.createdAt,
        dateModified: post.updatedAt,
        articleSection: post.category.name,
        keywords: uniqueKeywords([...(post.seo?.keywords || []), ...post.tags.map(tag => tag.name)]).join(', '),
        isAccessibleForFree: !post.restricted,
        author: {
          '@type': 'Person',
          name: post.author.name,
          url: absoluteUrl('/info'),
        },
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
      <PostDetail post={post} />
    </>
  );
}

export const revalidate = 3600;
