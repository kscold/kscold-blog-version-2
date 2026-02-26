'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="prose prose-lg max-w-none prose-headings:font-sans prose-headings:tracking-tight prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-a:decoration-1 prose-a:underline-offset-4 hover:prose-a:text-blue-800 prose-code:text-gray-800 prose-code:bg-gray-100 prose-code:rounded prose-code:border prose-code:border-gray-200 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-blockquote:border-l-gray-400 prose-blockquote:bg-gray-50 prose-blockquote:text-gray-600">
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
                  className="rounded-none !bg-black !border !border-surface-800 !my-0"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code
                className="px-1.5 py-0.5 bg-surface-900 text-white rounded-sm border border-surface-800 text-sm font-mono"
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
                className="rounded-none w-full border border-surface-800"
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
