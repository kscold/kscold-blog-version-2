import { useMutation } from '@tanstack/react-query';
import {
  createFeedCopilotDraft,
  createFeedCopilotPlan,
  type FeedCopilotDraftInput,
  type FeedCopilotPlanInput,
} from './feedCopilotApi';

export function useFeedCopilotPlan() {
  return useMutation({
    mutationFn: (input: FeedCopilotPlanInput) => createFeedCopilotPlan(input),
  });
}

export function useFeedCopilotDraft() {
  return useMutation({
    mutationFn: (input: FeedCopilotDraftInput) => createFeedCopilotDraft(input),
  });
}
