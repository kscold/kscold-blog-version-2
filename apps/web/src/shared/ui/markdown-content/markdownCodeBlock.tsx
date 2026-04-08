'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { MermaidBlock } from '@/shared/ui/MermaidBlock';

const LANGUAGE_ALIASES: Record<string, string> = {
  ts: 'typescript',
  tsx: 'tsx',
  js: 'javascript',
  jsx: 'jsx',
  py: 'python',
  kt: 'kotlin',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  yml: 'yaml',
  md: 'markdown',
  cs: 'csharp',
  'c#': 'csharp',
  'c++': 'cpp',
};

export function normalizeLanguage(language: string) {
  const normalized = language.trim().toLowerCase();
  return LANGUAGE_ALIASES[normalized] ?? normalized;
}

function formatLanguageLabel(language: string) {
  const normalized = normalizeLanguage(language);

  if (normalized === 'typescript') return 'TypeScript';
  if (normalized === 'javascript') return 'JavaScript';
  if (normalized === 'bash') return 'Bash';
  if (normalized === 'java') return 'Java';
  if (normalized === 'python') return 'Python';
  if (normalized === 'kotlin') return 'Kotlin';
  if (normalized === 'yaml') return 'YAML';
  if (normalized === 'json') return 'JSON';
  if (normalized === 'jsx') return 'JSX';
  if (normalized === 'tsx') return 'TSX';
  if (normalized === 'csharp') return 'C#';
  if (normalized === 'cpp') return 'C++';

  return language.toUpperCase();
}

function looksLikeMermaid(codeText: string) {
  const firstMeaningfulLine = codeText
    .split('\n')
    .map(line => line.trim())
    .find(line => line.length > 0);

  if (!firstMeaningfulLine) return false;

  return /^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|mindmap|timeline|gitGraph|quadrantChart|requirementDiagram|C4Context|C4Container|C4Component|C4Dynamic|C4Deployment)\b/i.test(
    firstMeaningfulLine
  );
}

interface MarkdownCodeBlockProps {
  className?: string;
  children: React.ReactNode;
  isDark: boolean;
}

export function MarkdownCodeBlock({
  className,
  children,
  isDark,
}: MarkdownCodeBlockProps) {
  const match = /language-([a-z0-9+#-]+)/i.exec(className || '');
  const rawLanguage = match ? match[1] : '';
  const language = rawLanguage ? normalizeLanguage(rawLanguage) : '';
  const codeText = String(children).replace(/\n$/, '');
  const isBlock = Boolean(rawLanguage) || String(children).endsWith('\n') || String(children).includes('\n');
  const isMermaidBlock = language === 'mermaid' || (!language && looksLikeMermaid(codeText));

  if (!isBlock) {
    return (
      <code
        className={`rounded-md px-1.5 py-0.5 text-sm font-mono before:content-none after:content-none ${
          isDark ? 'bg-surface-800/80 text-surface-200' : 'bg-surface-100 text-surface-800'
        }`}
      >
        {children}
      </code>
    );
  }

  if (isMermaidBlock) {
    return <MermaidBlock chart={codeText} theme={isDark ? 'dark' : 'light'} />;
  }

  if (!language) {
    return (
      <div className="not-prose relative my-6">
        <MarkdownCopyButton codeText={codeText} isDark={isDark} />
        <pre
          className={`my-0 overflow-x-auto rounded-xl border p-5 shadow-sm ${
            isDark ? 'border-surface-800 bg-[#0f111a]' : 'border-surface-200 bg-surface-50'
          }`}
        >
          <code
            className={`whitespace-pre text-sm font-mono ${
              isDark ? 'text-surface-200' : 'text-surface-800'
            }`}
          >
            {codeText}
          </code>
        </pre>
      </div>
    );
  }

  return (
    <div className="not-prose relative my-6 group">
      <div className="absolute left-3 top-3 z-10">
        <span
          data-code-language={rawLanguage.toLowerCase()}
          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
            isDark ? 'bg-surface-800/90 text-surface-300' : 'bg-white/90 text-surface-500 shadow-sm'
          }`}
        >
          {formatLanguageLabel(rawLanguage)}
        </span>
      </div>
      <MarkdownCopyButton codeText={codeText} isDark={isDark} />
      <div
        className={`overflow-x-auto rounded-xl border shadow-sm ${
          isDark ? 'border-surface-800 bg-[#0f111a]' : 'border-surface-200 bg-surface-50'
        }`}
      >
        <SyntaxHighlighter
          style={isDark ? vscDarkPlus : oneLight}
          language={language}
          PreTag="div"
          className="!my-0 !border-0 !bg-transparent"
          customStyle={{
            margin: 0,
            padding: '1.25rem',
            minWidth: 'max-content',
            background: 'transparent',
          }}
        >
          {codeText}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

function MarkdownCopyButton({ codeText, isDark }: { codeText: string; isDark: boolean }) {
  return (
    <div className="absolute right-3 top-3 z-10 opacity-0 transition-opacity group-hover:opacity-100">
      <button
        onClick={() => {
          navigator.clipboard.writeText(codeText);
        }}
        className={`rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
          isDark
            ? 'border border-surface-700 bg-surface-800 text-surface-100 hover:bg-surface-700 hover:text-white'
            : 'border border-surface-200 bg-surface-100 text-surface-600 hover:bg-surface-200 hover:text-surface-900'
        }`}
      >
        Copy
      </button>
    </div>
  );
}
