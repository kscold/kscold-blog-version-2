export interface ParsedMarkdownFile {
  filename: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  tags: string[];
  category: string | null;
  date: string | null;
  coverImage: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  rawFrontmatter: Record<string, unknown>;
  parseWarnings: string[];
}

export interface ImportResult {
  filename: string;
  success: boolean;
  postId?: string;
  error?: string;
}

export type ImportStatus = 'idle' | 'parsing' | 'previewing' | 'importing' | 'done';
