import { useSavePost } from '../api/useSavePost';

export function usePostCreate() {
  const mutation = useSavePost();
  return { handleSubmit: mutation.mutateAsync, isSubmitting: mutation.isPending };
}
