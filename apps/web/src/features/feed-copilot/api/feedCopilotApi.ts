import { apiClient } from '@/shared/api/api-client';

export type FeedCopilotStyle = 'short' | 'developer' | 'candid' | 'calm' | 'warm';

export interface FeedCopilotReference {
  id: string;
  title: string;
  slug: string;
  score: number;
  type: string;
  path: string;
  excerpt: string;
}

export interface FeedCopilotPlan {
  title: string;
  angle: string;
  keyPoints: string[];
  sourceSummary: string;
  references: FeedCopilotReference[];
}

export interface FeedCopilotDraft {
  title: string;
  content: string;
  tags: string[];
  references: FeedCopilotReference[];
}

export interface FeedCopilotPlanInput {
  memo: string;
  sourceUrl: string;
  styles: FeedCopilotStyle[];
}

export interface FeedCopilotDraftInput extends FeedCopilotPlanInput {
  planTitle: string;
  planAngle: string;
  planKeyPoints: string[];
}

export function createFeedCopilotPlan(input: FeedCopilotPlanInput) {
  return apiClient.post<FeedCopilotPlan>('/feeds/copilot/plan', input);
}

export function createFeedCopilotDraft(input: FeedCopilotDraftInput) {
  return apiClient.post<FeedCopilotDraft>('/feeds/copilot/draft', input);
}
