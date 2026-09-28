/** @jsxImportSource react */
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { remarkLooseStrong } from '@/shared/lib/remarkLooseStrong';

interface AgentMarkdownProps {
  content: string;
  sectionIds: readonly string[];
  onSourceClick?: () => void;
}

const ALLOWED_ELEMENTS = [
  'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'del',
  'ul', 'ol', 'li', 'blockquote', 'hr', 'pre', 'code', 'table', 'thead',
  'tbody', 'tr', 'th', 'td', 'a', 'input',
];

function isPageAnchor(href: string | undefined, sectionIds: readonly string[]): boolean {
  return !!href && href.startsWith('#') && sectionIds.includes(href.slice(1));
}

/** 생성한 답변은 서식만 표시하고 미디어·HTML·페이지 밖 링크는 실행하지 않는다. */
export function AgentMarkdown({ content, sectionIds, onSourceClick }: AgentMarkdownProps) {
  return (
    <div className="prose prose-sm min-w-0 max-w-none break-words text-surface-700 prose-headings:font-sans prose-headings:font-semibold prose-headings:text-surface-900 prose-h3:mb-2 prose-h3:mt-5 prose-h3:text-base prose-h4:text-sm prose-p:my-2 prose-p:whitespace-normal prose-p:leading-7 prose-strong:text-surface-900 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-blockquote:border-primary-300 prose-blockquote:bg-primary-50 prose-blockquote:py-1 prose-blockquote:pl-4 prose-blockquote:not-italic prose-code:rounded prose-code:bg-surface-100 prose-code:px-1 prose-code:py-0.5 prose-code:font-mono prose-code:text-surface-800 prose-code:before:content-none prose-code:after:content-none prose-pre:rounded-lg prose-pre:border prose-pre:border-surface-200 prose-pre:bg-surface-50 prose-pre:text-surface-800 prose-hr:border-surface-200 [&>:first-child]:mt-0 [&>:last-child]:mb-0 [&_pre_code]:bg-transparent [&_pre_code]:p-0">
      <ReactMarkdown
        remarkPlugins={[[remarkGfm, { singleTilde: false }], remarkLooseStrong]}
        allowedElements={ALLOWED_ELEMENTS}
        skipHtml
        urlTransform={(url, key) => key === 'href' && isPageAnchor(url, sectionIds) ? url : ''}
        components={{
          h1: ({ children }) => <h3>{children}</h3>,
          h2: ({ children }) => <h3>{children}</h3>,
          h5: ({ children }) => <h4>{children}</h4>,
          h6: ({ children }) => <h4>{children}</h4>,
          a: ({ href, children }) => isPageAnchor(href, sectionIds) ? (
            <a href={href} onClick={onSourceClick} className="text-primary-700 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-600">{children}</a>
          ) : <span>{children}</span>,
          table: ({ children }) => (
            <div role="region" aria-label="답변 표" tabIndex={0} className="my-3 w-full max-w-full overflow-x-auto rounded-lg border border-surface-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-600">
              <table className="m-0 min-w-full border-collapse text-xs [&_td]:min-w-28 [&_td]:border-t [&_td]:border-surface-200 [&_td]:p-3 [&_th]:min-w-28 [&_th]:bg-surface-50 [&_th]:p-3 [&_th]:text-left [&_th]:text-surface-900">{children}</table>
            </div>
          ),
          pre: ({ children }) => <pre tabIndex={0} aria-label="코드 예시" className="max-w-full overflow-x-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-600">{children}</pre>,
          input: ({ checked }) => <input type="checkbox" checked={checked ?? false} readOnly disabled aria-label={checked ? '완료한 항목' : '미완료 항목'} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
