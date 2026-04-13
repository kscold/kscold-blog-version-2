import React from 'react';
import type { Components } from 'react-markdown';
import { getVideoEmbedConfig } from '@/shared/lib/videoEmbed';
import { VideoEmbed } from '@/shared/ui/VideoEmbed';
import { MarkdownCodeBlock } from './markdownCodeBlock';

function extractStandaloneLink(children: React.ReactNode) {
  const childArray = React.Children.toArray(children);
  if (childArray.length !== 1) return null;

  const onlyChild = childArray[0];
  if (typeof onlyChild === 'string') {
    const value = onlyChild.trim();
    return value.startsWith('http://') || value.startsWith('https://') ? value : null;
  }

  if (!React.isValidElement<{ href?: string }>(onlyChild)) return null;

  const href = onlyChild.props.href?.trim();
  if (!href) return null;

  return href.startsWith('http://') || href.startsWith('https://') ? href : null;
}

export function createMarkdownComponents(isDark: boolean): Components {
  return {
    p: ({ children }) => {
      const standaloneLink = extractStandaloneLink(children);

      if (standaloneLink && getVideoEmbedConfig(standaloneLink)) {
        return <VideoEmbed url={standaloneLink} />;
      }

      return <p>{children}</p>;
    },
    a: ({ href, children }) => (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    strong: ({ children }) => <strong className="markdown-strong">{children}</strong>,
    code(props) {
      const { className, children } = props;
      return <MarkdownCodeBlock className={className} isDark={isDark}>{children}</MarkdownCodeBlock>;
    },
    img: ({ src, alt }) => (
      <div className="my-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt || ''}
          className="w-full rounded-2xl border border-white/10 shadow-lg"
          loading="lazy"
        />
        {alt && <p className="mt-2 text-center font-mono text-sm text-surface-500">{alt}</p>}
      </div>
    ),
    table: ({ children }) => (
      <div className="my-8 overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">{children}</table>
      </div>
    ),
    th: ({ children }) => (
      <th
        className={`whitespace-nowrap border px-4 py-2 text-left font-semibold ${
          isDark
            ? 'border-surface-700 bg-surface-900 text-surface-100'
            : 'border-surface-200 bg-surface-50 text-surface-900'
        }`}
      >
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td
        className={`border px-4 py-2 align-top ${
          isDark ? 'border-surface-800 text-surface-300' : 'border-surface-200 text-surface-700'
        }`}
      >
        {children}
      </td>
    ),
  };
}
