'use client';

import { useRouter } from 'next/navigation';
import { useCreatePost } from '@/entities/post/api/usePosts';
import { PostEditor, PostFormData } from '@/features/editor/ui/PostEditor';

export default function NewPostPage() {
  const router = useRouter();
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
        metaTitle: data.metaTitle || undefined,
        metaDescription: data.metaDescription || undefined,
        keywords: keywords.length > 0 ? keywords : undefined,
      });

      alert('포스트가 생성되었습니다!');
      router.push('/admin/posts');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '포스트 생성에 실패했습니다.';
      alert(message);
    }
  };

  return (
    <PostEditor
      mode="create"
      onSubmit={handleSubmit}
      isSubmitting={createPost.isPending}
      autosaveKey="autosave-new-post"
    />
  );
}
