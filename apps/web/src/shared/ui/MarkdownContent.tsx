'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { remarkLooseStrong } from '@/shared/lib/remarkLooseStrong';
import { createMarkdownComponents } from '@/shared/ui/markdown-content/markdownComponents';

interface MarkdownContentProps {
  content: string;
  theme?: 'light' | 'dark';
}

export function MarkdownContent({ content, theme = 'light' }: MarkdownContentProps) {
  const isDark = theme === 'dark';

  const proseClasses = isDark
    ? 'markdown-prose prose prose-invert prose-lg max-w-none prose-headings:font-sans prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-surface-50 text-surface-300 prose-a:text-surface-100 prose-a:decoration-surface-500 prose-a:underline-offset-4 hover:prose-a:text-white hover:prose-a:decoration-white prose-code:text-surface-200 prose-code:bg-surface-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-strong:text-white prose-ul:text-surface-300 prose-ol:text-surface-300 prose-blockquote:border-l-surface-600 prose-blockquote:bg-surface-900/50 prose-blockquote:text-surface-400 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-hr:border-surface-800'
    : 'markdown-prose prose prose-lg max-w-none prose-headings:font-sans prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-surface-900 text-surface-700 prose-a:text-surface-900 prose-a:decoration-surface-300 prose-a:underline-offset-4 hover:prose-a:decoration-surface-900 prose-code:text-surface-800 prose-code:bg-surface-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-strong:text-surface-900 prose-ul:text-surface-700 prose-ol:text-surface-700 prose-blockquote:border-l-surface-300 prose-blockquote:bg-surface-50 prose-blockquote:text-surface-600 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-hr:border-surface-200';

  return (
    <div className={`${proseClasses} min-w-0`}>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkLooseStrong]} components={createMarkdownComponents(isDark)}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
