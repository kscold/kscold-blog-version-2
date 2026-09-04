'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import apiClient from '@/shared/api/api-client';
import { useViewer } from '@/entities/user';
import { Skeleton } from '@/shared/ui/Skeleton';
import type { Post } from '@/shared/model/types/blog';
import { PostCommentSection } from './PostCommentSection';
import { PostHeader } from './PostHeader';
import { RestrictedOverlay } from './RestrictedOverlay';

interface RestrictedPostDetailProps {
  post: Post;
}

const MarkdownContent = dynamic(
  () => import('@/shared/ui/MarkdownContent').then(module => module.MarkdownContent),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-11/12" />
        <Skeleton className="h-5 w-4/5" />
      </div>
    ),
  }
);

export function RestrictedPostDetail({ post }: RestrictedPostDetailProps) {
  const { isAuthenticated, role } = useViewer();
  const [resolvedPost, setResolvedPost] = useState(post);
  const [isResolvingAccess, setIsResolvingAccess] = useState(false);

  useEffect(() => {
    setResolvedPost(post);
  }, [post]);

  useEffect(() => {
    if (!isAuthenticated && post.restricted && !post.content) {
      setResolvedPost(post);
      setIsResolvingAccess(false);
    }
  }, [isAuthenticated, post]);

  useEffect(() => {
    if (!isAuthenticated || !post.restricted || post.content) {
      return;
    }

    let active = true;

    const resolveRestrictedPost = async () => {
      setIsResolvingAccess(true);

      try {
        const latestPost = await apiClient.get<Post>(`/posts/slug/${post.slug}`);

        if (!active) return;

        if (latestPost?.content) {
          setResolvedPost(latestPost);
        }
      } catch (error) {
        console.error('Failed to resolve restricted post access', error);
      } finally {
        if (active) setIsResolvingAccess(false);
      }
    };

    void resolveRestrictedPost();

    return () => {
      active = false;
    };
  }, [isAuthenticated, post.content, post.restricted, post.slug]);

  const formattedDate = resolvedPost.publishedAt
    ? new Date(resolvedPost.publishedAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';
  const isRestricted = Boolean(resolvedPost.restricted && !resolvedPost.content);
  const isCheckingRestrictedAccess = isRestricted && isAuthenticated && isResolvingAccess;
  const headerExcerpt = isRestricted ? resolvedPost.excerpt : undefined;
  const accessStatusMessage = useMemo(
    () =>
      role === 'ADMIN'
        ? '관리자 권한으로 열람 가능 여부를 확인하고 있습니다.'
        : '승인된 열람 권한이 있는지 확인하고 있습니다.',
    [role]
  );

  return (
    <div className="min-h-screen bg-surface-50">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PostHeader
          title={resolvedPost.title}
          excerpt={headerExcerpt}
          coverImage={resolvedPost.coverImage}
          category={resolvedPost.category}
          author={resolvedPost.author}
          views={resolvedPost.views}
          likes={resolvedPost.likes}
          featured={resolvedPost.featured}
          formattedDate={formattedDate}
          restricted
        />

        {isCheckingRestrictedAccess ? (
          <div className="mb-12 overflow-hidden rounded-[28px] border border-surface-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-3 w-3 animate-pulse rounded-full bg-surface-900" />
              <p className="text-sm font-medium text-surface-600">{accessStatusMessage}</p>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-8 w-2/5" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-11/12" />
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-56 w-full rounded-[24px]" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-10/12" />
            </div>
          </div>
        ) : isRestricted ? (
          <RestrictedOverlay
            postId={resolvedPost.id}
            postTitle={resolvedPost.title}
            categoryId={resolvedPost.category?.id}
            categoryName={resolvedPost.category?.name}
            excerpt={resolvedPost.excerpt}
          />
        ) : (
          <>
            <div className="mb-12">
              <MarkdownContent
                content={resolvedPost.content}
                prioritizeFirstImage
                demotePrimaryHeading
              />
            </div>
            <PostCommentSection tags={resolvedPost.tags} />
          </>
        )}
      </article>
    </div>
  );
}
