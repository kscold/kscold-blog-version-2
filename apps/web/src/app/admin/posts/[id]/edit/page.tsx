'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAdminPost, useUpdatePost } from '@/entities/post/api/usePosts';
import { PostEditor, PostFormData } from '@/features/editor/ui/PostEditor';
import { useAlert } from '@/shared/model/alertStore';

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const alert = useAlert();
  const postId = params.id as string;

  const { data: post, isLoading } = useAdminPost(postId);
  const updatePost = useUpdatePost();

  const initialData: Partial<PostFormData> | null = post
    ? {
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt || '',
        coverImage: post.coverImage || '',
        categoryId: post.category.id,
        tagIds: post.tags?.map(t => t.id) || [],
        status: post.status,
        featured: post.featured || false,
        metaTitle: post.seo?.metaTitle || '',
        metaDescription: post.seo?.metaDescription || '',
        keywords: post.seo?.keywords?.join(', ') || '',
      }
    : null;

  const handleSubmit = async (data: PostFormData) => {
    const keywords = data.keywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k);

    await updatePost.mutateAsync({
      id: postId,
      data: {
        title: data.title,
        slug: data.slug || undefined,
        content: data.content,
        excerpt: data.excerpt || undefined,
        coverImage: data.coverImage || undefined,
        categoryId: data.categoryId,
        tagIds: data.tagIds.length > 0 ? data.tagIds : undefined,
        status: data.status,
        featured: data.featured,
        metaTitle: data.metaTitle || undefined,
        metaDescription: data.metaDescription || undefined,
        keywords: keywords.length > 0 ? keywords : undefined,
      },
    });

    alert.success('포스트가 수정되었습니다!');
    router.push('/admin/posts');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-beige dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">포스트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!initialData) return null;

  return (
    <PostEditor
      mode="edit"
      initialData={initialData}
      onSubmit={handleSubmit}
      isSubmitting={updatePost.isPending}
      autosaveKey={`autosave-post-${postId}`}
    />
  );
}
