'use client';

import SyntaxHighlighter from 'react-syntax-highlighter/dist/cjs/prism-light';
import bash from 'react-syntax-highlighter/dist/cjs/languages/prism/bash';
import cpp from 'react-syntax-highlighter/dist/cjs/languages/prism/cpp';
import csharp from 'react-syntax-highlighter/dist/cjs/languages/prism/csharp';
import css from 'react-syntax-highlighter/dist/cjs/languages/prism/css';
import docker from 'react-syntax-highlighter/dist/cjs/languages/prism/docker';
import go from 'react-syntax-highlighter/dist/cjs/languages/prism/go';
import graphql from 'react-syntax-highlighter/dist/cjs/languages/prism/graphql';
import groovy from 'react-syntax-highlighter/dist/cjs/languages/prism/groovy';
import java from 'react-syntax-highlighter/dist/cjs/languages/prism/java';
import javascript from 'react-syntax-highlighter/dist/cjs/languages/prism/javascript';
import json from 'react-syntax-highlighter/dist/cjs/languages/prism/json';
import jsx from 'react-syntax-highlighter/dist/cjs/languages/prism/jsx';
import kotlin from 'react-syntax-highlighter/dist/cjs/languages/prism/kotlin';
import markdown from 'react-syntax-highlighter/dist/cjs/languages/prism/markdown';
import markup from 'react-syntax-highlighter/dist/cjs/languages/prism/markup';
import properties from 'react-syntax-highlighter/dist/cjs/languages/prism/properties';
import python from 'react-syntax-highlighter/dist/cjs/languages/prism/python';
import rust from 'react-syntax-highlighter/dist/cjs/languages/prism/rust';
import sql from 'react-syntax-highlighter/dist/cjs/languages/prism/sql';
import tsx from 'react-syntax-highlighter/dist/cjs/languages/prism/tsx';
import typescript from 'react-syntax-highlighter/dist/cjs/languages/prism/typescript';
import yaml from 'react-syntax-highlighter/dist/cjs/languages/prism/yaml';
import a11yOneLight from 'react-syntax-highlighter/dist/cjs/styles/prism/a11y-one-light';
import vscDarkPlus from 'react-syntax-highlighter/dist/cjs/styles/prism/vsc-dark-plus';

const SUPPORTED_LANGUAGES = {
  bash,
  cpp,
  csharp,
  css,
  docker,
  dockerfile: docker,
  go,
  graphql,
  groovy,
  html: markup,
  java,
  javascript,
  json,
  jsx,
  kotlin,
  markdown,
  markup,
  properties,
  python,
  rust,
  sql,
  tsx,
  typescript,
  xml: markup,
  yaml,
};

for (const [name, grammar] of Object.entries(SUPPORTED_LANGUAGES)) {
  SyntaxHighlighter.registerLanguage(name, grammar);
}

interface CodeHighlighterProps {
  codeText: string;
  language: string;
  isDark: boolean;
}

export default function CodeHighlighter({ codeText, language, isDark }: CodeHighlighterProps) {
  return (
    <SyntaxHighlighter
      style={isDark ? vscDarkPlus : a11yOneLight}
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
