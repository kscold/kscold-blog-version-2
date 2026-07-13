import { useRouter } from 'next/navigation';
import { useAdminPost } from '@/entities/post';
import { useUpdatePost } from '@/entities/post';
import { useAlert } from '@/shared/model/alertStore';
import type { PostFormData } from '@/features/editor/model/types';

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
        // 깨진/유령 태그(id가 null·빈 값)는 제외 — 저장 시 백엔드 resolveTags 404 방지
        tagIds: post.tags?.map(t => t.id).filter((id): id is string => Boolean(id)) || [],
        status: post.status,
        featured: post.featured || false,
        publicOverride: post.publicOverride || false,
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

    // 혹시 모를 null·빈 태그 id를 한 번 더 제거 (백엔드 resolveTags 404 방지)
    const tagIds = data.tagIds.filter((id): id is string => Boolean(id));

    await updatePost.mutateAsync({
      id: postId,
      data: {
        title: data.title,
        slug: data.slug || undefined,
        content: data.content,
        excerpt: data.excerpt || undefined,
        coverImage: data.coverImage || undefined,
        categoryId: data.categoryId,
        tagIds: tagIds.length > 0 ? tagIds : undefined,
        status: data.status,
        featured: data.featured,
        publicOverride: data.publicOverride,
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
