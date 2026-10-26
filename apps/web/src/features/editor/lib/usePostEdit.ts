import { useAdminPost } from '@/entities/post';
import { useSavePost } from '../api/useSavePost';

export function usePostEdit(postId: string) {
  const query = useAdminPost(postId);
  const mutation = useSavePost(postId);
  return {
    post: query.data, isLoading: query.isLoading, error: query.error,
    handleSubmit: mutation.mutateAsync, isSubmitting: mutation.isPending,
  };
}
