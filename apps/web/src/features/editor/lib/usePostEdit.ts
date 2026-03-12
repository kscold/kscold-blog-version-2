import { useRouter } from 'next/navigation';
import { useAdminPost, useUpdatePost } from '@/entities/post/api/usePosts';
import { useAlert } from '@/shared/model/alertStore';
import type { PostFormData } from '@/features/editor/ui/PostEditor';

export function usePostEdit(postId: string) {
  const router = useRouter();
  const alert = useAlert();
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

  return { initialData, isLoading, handleSubmit, isSubmitting: updatePost.isPending };
}
