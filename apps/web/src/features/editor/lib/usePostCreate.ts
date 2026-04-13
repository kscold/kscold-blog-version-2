import { useRouter } from 'next/navigation';
import { useCreatePost } from '@/entities/post/api/usePosts';
import { useAlert } from '@/shared/model/alertStore';
import type { PostFormData } from '@/features/editor/model/types';

export function usePostCreate() {
  const router = useRouter();
  const alert = useAlert();
  const createPost = useCreatePost();

  const handleSubmit = async (data: PostFormData) => {
    try {
      const keywords = data.keywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k);

      await createPost.mutateAsync({
        title: data.title,
        slug: data.slug || undefined,
        content: data.content,
        excerpt: data.excerpt || undefined,
        coverImage: data.coverImage || undefined,
        categoryId: data.categoryId,
        tagIds: data.tagIds.length > 0 ? data.tagIds : undefined,
        status: data.status === 'ARCHIVED' ? 'DRAFT' : data.status,
        featured: data.featured,
        publicOverride: data.publicOverride,
        metaTitle: data.metaTitle || undefined,
        metaDescription: data.metaDescription || undefined,
        keywords: keywords.length > 0 ? keywords : undefined,
      });

      alert.success('포스트가 생성되었습니다!');
      router.push('/admin/posts');
    } catch (err) {
      const message = err instanceof Error ? err.message : '포스트 생성에 실패했습니다.';
      alert.error(message);
    }
  };

  return { handleSubmit, isSubmitting: createPost.isPending };
}
