import type { FeedCopilotDraft } from '../api/feedCopilotApi';

export interface FeedCopilotTransferDraft {
  title: string;
  content: string;
  tags: string[];
  sourceUrl: string;
}

export const FEED_COPILOT_DRAFT_EVENT = 'kscold:feed-copilot-draft-ready';

const storageKey = 'kscold-feed-copilot-draft';

export function stageFeedCopilotDraft(draft: FeedCopilotDraft, sourceUrl: string) {
  if (typeof window === 'undefined') {
    return;
  }

  const payload: FeedCopilotTransferDraft = {
    title: draft.title,
    content: draft.content,
    tags: draft.tags,
    sourceUrl,
  };
  window.sessionStorage.setItem(storageKey, JSON.stringify(payload));
  window.dispatchEvent(new Event(FEED_COPILOT_DRAFT_EVENT));
}

export function takeFeedCopilotDraft(): FeedCopilotTransferDraft | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const storedDraft = window.sessionStorage.getItem(storageKey);
  if (!storedDraft) {
    return null;
  }

  window.sessionStorage.removeItem(storageKey);

  try {
    const draft = JSON.parse(storedDraft) as Partial<FeedCopilotTransferDraft>;
    if (typeof draft.title !== 'string' || typeof draft.content !== 'string') {
      return null;
    }

    return {
      title: draft.title,
      content: draft.content,
      tags: Array.isArray(draft.tags)
        ? draft.tags.filter((tag): tag is string => typeof tag === 'string')
        : [],
      sourceUrl: typeof draft.sourceUrl === 'string' ? draft.sourceUrl : '',
    };
  } catch {
    return null;
  }
}
