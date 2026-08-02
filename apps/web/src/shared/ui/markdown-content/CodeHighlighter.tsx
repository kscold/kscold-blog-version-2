'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface CodeHighlighterProps {
  codeText: string;
  language: string;
  isDark: boolean;
}

export default function CodeHighlighter({ codeText, language, isDark }: CodeHighlighterProps) {
  return (
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
  );
}
