'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/shared/api/api-client';
import { linkify, type LinkifySegment } from '@/shared/lib/linkify';

interface LinkifiedTextProps {
  text: string;
  className?: string;
  /** inline 자식 요소 (예: 작성자 이름) */
  prefix?: React.ReactNode;
}

export function LinkifiedText({ text, className, prefix }: LinkifiedTextProps) {
  const segments = linkify(text);
  return (
    <p className={className}>
      {prefix}
      {segments.map((seg, idx) => (
        <Fragment key={idx}>{renderSegment(seg)}</Fragment>
      ))}
    </p>
  );
}

function renderSegment(seg: LinkifySegment) {
  if (seg.kind === 'text') return seg.value;
  if (seg.kind === 'blog-post') return <BlogPostLink href={seg.href} slug={seg.slug} />;
  if (seg.kind === 'feed') return <FeedLink href={seg.href} feedId={seg.feedId} />;
  return (
    <a
      href={seg.href}
      target="_blank"
      rel="noopener noreferrer"
      className={EXTERNAL_LINK_CLASS}
    >
      <LinkIcon />
      <span className="truncate max-w-[28rem]">{stripProtocol(seg.label)}</span>
    </a>
  );
}

function BlogPostLink({ href, slug }: { href: string; slug: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['linkify-post', slug],
    queryFn: () => apiClient.get<{ title: string }>(`/posts/slug/${encodeURIComponent(slug)}`),
    staleTime: 60 * 60 * 1000,
    retry: false,
  });
  return (
    <Link href={href} className={INTERNAL_LINK_CLASS}>
      <LinkIcon />
      {isLoading ? <SkeletonLabel /> : <span>{data?.title ?? stripProtocol(href)}</span>}
    </Link>
  );
}

function FeedLink({ href, feedId }: { href: string; feedId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['linkify-feed', feedId],
    queryFn: () =>
      apiClient.get<{ content?: string; author?: { name?: string } }>(`/feed/${feedId}`),
    staleTime: 60 * 60 * 1000,
    retry: false,
  });
  return (
    <Link href={href} className={INTERNAL_LINK_CLASS}>
      <LinkIcon />
      {isLoading ? <SkeletonLabel /> : <span>{buildFeedLabel(data) ?? stripProtocol(href)}</span>}
    </Link>
  );
}

function buildFeedLabel(data?: { content?: string; author?: { name?: string } }): string | undefined {
  if (!data) return undefined;
  const trimmed = (data.content ?? '').split('\n')[0].trim();
  if (trimmed) return trimmed.length > 40 ? `${trimmed.slice(0, 40)}…` : trimmed;
  return data.author?.name ? `${data.author.name}의 피드` : undefined;
}

function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/^www\./, '');
}

function SkeletonLabel() {
  return <span className="inline-block w-16 h-3 bg-surface-200 rounded animate-pulse" />;
}

function LinkIcon() {
  return (
    <svg className="w-3 h-3 shrink-0 text-surface-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 015.656 5.656l-3 3a4 4 0 01-5.656-5.656m1.414-3.414a4 4 0 00-5.656-5.656l-3 3a4 4 0 005.656 5.656" />
    </svg>
  );
}

const INTERNAL_LINK_CLASS =
  'inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded-md bg-surface-100 hover:bg-surface-200 border border-surface-200 text-surface-900 font-medium text-[0.95em] transition-colors align-baseline';

const EXTERNAL_LINK_CLASS =
  'inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded-md bg-surface-50 hover:bg-surface-100 border border-surface-200 text-surface-700 text-[0.95em] transition-colors align-baseline break-all';
