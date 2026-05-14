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
    p: ({ children, className, node }) => {
      const standaloneLink = extractStandaloneLink(children);
      if (standaloneLink && getVideoEmbedConfig(standaloneLink)) {
        return <VideoEmbed url={standaloneLink} />;
      }

      // hast는 className을 string 또는 string[] 로 전달 — 둘 다 처리
      const classStr = Array.isArray(className) ? className.join(' ') : (className ?? '');
      const isGrid = classStr.includes('md-image-grid');
      if (isGrid) {
        const hastChildren = (node as any)?.children ?? [];
        const imgNodes = hastChildren.filter(
          (c: any) => c.type === 'element' && c.tagName === 'img',
        );
        if (imgNodes.length >= 2) {
          return (
            <div className={`my-8 grid gap-3 ${imgNodes.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {imgNodes.map((imgNode: any, i: number) => {
                const src = imgNode.properties?.src as string | undefined;
                const alt = (imgNode.properties?.alt as string | undefined) ?? '';
                return (
                  <div key={i}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={alt}
                      className="w-full rounded-2xl border border-white/10 shadow-lg object-cover"
                      loading="lazy"
                    />
                    {alt && (
                      <span className="mt-2 block text-center font-mono text-sm text-surface-500">
                        {alt}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        }
      }

      return <p>{children}</p>;
    },
    div: ({ children, className, node }) => {
      const classStr = Array.isArray(className) ? className.join(' ') : (className ?? '');
      if (classStr.includes('md-image-grid')) {
        const imgNodes = ((node as any)?.children ?? []).filter(
          (c: any) => c.type === 'element' && c.tagName === 'img',
        );
        if (imgNodes.length >= 2) {
          return (
            <div className={`my-8 grid gap-3 ${imgNodes.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {imgNodes.map((imgNode: any, i: number) => {
                const src = imgNode.properties?.src as string | undefined;
                const alt = (imgNode.properties?.alt as string | undefined) ?? '';
                return (
                  <div key={i}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={alt}
                      className="w-full rounded-2xl border border-white/10 shadow-lg object-cover"
                      loading="lazy"
                    />
                    {alt && (
                      <span className="mt-2 block text-center font-mono text-sm text-surface-500">
                        {alt}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        }
      }
      return <div className={classStr}>{children}</div>;
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
