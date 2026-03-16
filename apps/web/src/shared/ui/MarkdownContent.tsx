'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface MarkdownContentProps {
  content: string;
  theme?: 'light' | 'dark';
}

export function MarkdownContent({ content, theme = 'light' }: MarkdownContentProps) {
  const isDark = theme === 'dark';

  const proseClasses = isDark
    ? 'prose prose-invert prose-lg max-w-none prose-headings:font-sans prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-surface-50 text-surface-300 prose-p:leading-relaxed prose-a:text-surface-100 prose-a:decoration-surface-500 prose-a:underline-offset-4 hover:prose-a:text-white hover:prose-a:decoration-white prose-code:text-surface-200 prose-code:bg-surface-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-strong:text-white prose-ul:text-surface-300 prose-ol:text-surface-300 prose-blockquote:border-l-surface-600 prose-blockquote:bg-surface-900/50 prose-blockquote:text-surface-400 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-hr:border-surface-800'
    : 'prose prose-lg max-w-none prose-headings:font-sans prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-surface-900 text-surface-700 prose-p:leading-relaxed prose-a:text-surface-900 prose-a:decoration-surface-300 prose-a:underline-offset-4 hover:prose-a:decoration-surface-900 prose-code:text-surface-800 prose-code:bg-surface-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-strong:text-surface-900 prose-ul:text-surface-700 prose-ol:text-surface-700 prose-blockquote:border-l-surface-300 prose-blockquote:bg-surface-50 prose-blockquote:text-surface-600 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-hr:border-surface-200';

  return (
    <div className={proseClasses}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code(props) {
            const { className, children, ...rest } = props;
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            // trailing \n 포함 여부로 블록/인라인 구분 (react-markdown v8 기준)
            const isBlock = String(children).endsWith('\n') || String(children).includes('\n');
            const codeText = String(children).replace(/\n$/, '');

            if (!isBlock) {
              return (
                <code
                  className={`px-1.5 py-0.5 rounded-md text-sm font-mono ${
                    isDark
                      ? 'bg-surface-800/80 text-surface-200'
                      : 'bg-surface-100 text-surface-800'
                  }`}
                  {...rest}
                >
                  {children}
                </code>
              );
            }

            // 언어 있는 블록 코드 → SyntaxHighlighter
            if (language) {
              return (
                <div className="relative group my-6">
                  <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(codeText);
                      }}
                      className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors ${
                        isDark
                          ? 'bg-surface-800 text-surface-100 border border-surface-700 hover:bg-surface-700 hover:text-white'
                          : 'bg-surface-100 text-surface-600 border border-surface-200 hover:bg-surface-200 hover:text-surface-900'
                      }`}
                    >
                      Copy
                    </button>
                  </div>
                  <SyntaxHighlighter
                    style={isDark ? vscDarkPlus : oneLight}
                    language={language}
                    PreTag="div"
                    className={`rounded-xl !my-0 !p-5 shadow-sm !border ${
                      isDark
                        ? '!bg-[#0f111a] !border-surface-800'
                        : '!bg-surface-50 !border-surface-200'
                    }`}
                  >
                    {codeText}
                  </SyntaxHighlighter>
                </div>
              );
            }

            // 언어 없는 블록 코드 → 일반 pre 블록
            return (
              <div className="relative group my-6">
                <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(codeText);
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors ${
                      isDark
                        ? 'bg-surface-800 text-surface-100 border border-surface-700 hover:bg-surface-700 hover:text-white'
                        : 'bg-surface-100 text-surface-600 border border-surface-200 hover:bg-surface-200 hover:text-surface-900'
                    }`}
                  >
                    Copy
                  </button>
                </div>
                <pre className={`rounded-xl border p-5 shadow-sm overflow-x-auto my-0 ${
                  isDark
                    ? 'bg-[#0f111a] border-surface-800'
                    : 'bg-surface-50 border-surface-200'
                }`}>
                  <code className={`text-sm font-mono whitespace-pre ${isDark ? 'text-surface-200' : 'text-surface-800'}`}>
                    {codeText}
                  </code>
                </pre>
              </div>
            );
          },
          img: ({ src, alt }) => (
            <div className="my-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
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
