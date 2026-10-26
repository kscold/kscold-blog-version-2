import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { PostSubmission } from '../model/types';
import { toPostCreate, toPostUpdate } from '../lib/postForm';
import { savePost } from './savePost';

export function useSavePost(id?: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (submission: PostSubmission) => {
      const response = await savePost({ id, data: id ? toPostUpdate(submission) : toPostCreate(submission.form) });
      if (!response.ok) throw new Error(response.message);
      return response.result;
    },
    onSuccess: ({ post }) => {
      client.setQueryData(['posts', 'admin', post.id], post);
      void client.invalidateQueries({ queryKey: ['posts'] });
      void client.invalidateQueries({ queryKey: ['categories'] });
      void client.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}
