'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface MarkdownContentProps {
  content: string;
  theme?: 'light' | 'dark';
}

export function MarkdownContent({ content, theme = 'light' }: MarkdownContentProps) {
  const isDark = theme === 'dark';

  const proseClasses = isDark
    ? 'prose prose-invert prose-lg max-w-none prose-headings:font-sans prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-white prose-p:text-surface-300 prose-p:leading-relaxed prose-a:text-accent-light prose-a:decoration-accent-light/30 prose-a:underline-offset-4 hover:prose-a:decoration-accent-light hover:prose-a:text-white prose-code:text-accent-light prose-code:bg-surface-900/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:border prose-code:border-white/10 prose-strong:text-white prose-ul:text-surface-300 prose-ol:text-surface-300 prose-blockquote:border-l-accent-light/50 prose-blockquote:bg-surface-900/30 prose-blockquote:text-surface-400 prose-blockquote:px-6 prose-blockquote:py-2 prose-blockquote:rounded-r-2xl prose-blockquote:not-italic prose-hr:border-white/10'
    : 'prose prose-lg max-w-none prose-headings:font-sans prose-headings:tracking-tight prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-a:decoration-1 prose-a:underline-offset-4 hover:prose-a:text-blue-800 prose-code:text-gray-800 prose-code:bg-gray-100 prose-code:rounded prose-code:border prose-code:border-gray-200 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-blockquote:border-l-gray-400 prose-blockquote:bg-gray-50 prose-blockquote:text-gray-600';

  return (
    <div className={proseClasses}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';

            return !inline && language ? (
              <div className="relative group my-6">
                <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                    }}
                    className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-white text-black hover:bg-surface-200 rounded-sm transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={language}
                  PreTag="div"
                  className="rounded-xl !bg-[#050B14] !border !border-white/10 !my-0 !p-6 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code
                className={`px-1.5 py-0.5 rounded-md border text-sm font-mono ${
                  isDark
                    ? 'bg-surface-900/50 text-accent-light border-white/10'
                    : 'bg-surface-900 text-white border-surface-800'
                }`}
                {...props}
              >
                {children}
              </code>
            );
          },
          img: ({ src, alt }) => (
            <div className="my-8">
              <img
                src={src}
                alt={alt || ''}
                className="rounded-2xl w-full border border-white/10 shadow-lg"
                loading="lazy"
              />
              {alt && <p className="text-center text-sm text-surface-500 mt-2 font-mono">{alt}</p>}
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
