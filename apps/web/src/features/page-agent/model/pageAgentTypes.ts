export interface PageContext {
  title: string;
  path: string;
  sections: Array<{ id: string; title: string; content: string }>;
}

export interface PageMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sourceIds?: string[];
}

export type PageStreamEvent =
  | { type: 'stage'; detail: string }
  | { type: 'delta'; delta: string }
  | { type: 'complete'; answer: string; sourceIds: string[] }
  | { type: 'error'; message: string };
