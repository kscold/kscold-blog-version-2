import React from 'react';
import Link from 'next/link';
import type { Components } from 'react-markdown';
import { getVideoEmbedConfig } from '@/shared/lib/videoEmbed';
import { VideoEmbed } from '@/shared/ui/VideoEmbed';
import { VideoPlayer } from '@/shared/ui/VideoPlayer';
import { MarkdownCodeBlock } from './markdownCodeBlock';

const VIDEO_FILE_PATTERN = /\.(mp4|webm|mov)(\?.*)?$/i;

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

function normalizeClassName(className: string | string[] | undefined): string {
  // hast는 className을 string 또는 string[] 로 전달 — 둘 다 처리
  return Array.isArray(className) ? className.join(' ') : (className ?? '');
}

interface ImgHastNode {
  properties?: { src?: string; alt?: string };
}

function hasOnlyImages(node: unknown, count = 1): boolean {
  const children =
    (node as { children?: Array<{ type: string; tagName?: string; value?: string }> })?.children ?? [];
  const nonWhitespaceChildren = children.filter(
    child => !(child.type === 'text' && (child.value ?? '').trim() === ''),
  );
  return (
    nonWhitespaceChildren.length === count &&
    nonWhitespaceChildren.every(child => child.type === 'element' && child.tagName === 'img')
  );
}

function extractImageNodes(node: unknown): ImgHastNode[] {
  const children = (node as { children?: Array<{ type: string; tagName: string }> })?.children ?? [];
  return children.filter(c => c.type === 'element' && c.tagName === 'img') as ImgHastNode[];
}

function ImageGrid({ imgNodes }: { imgNodes: ImgHastNode[] }) {
  return (
    <div className={`my-8 grid gap-3 ${imgNodes.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
      {imgNodes.map((imgNode, i) => {
        const src = imgNode.properties?.src;
        const alt = imgNode.properties?.alt ?? '';
        return (
          <div key={i}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="w-full rounded-2xl border border-white/10 shadow-lg object-cover"
              loading="lazy"
            />
          </div>
        );
      })}
    </div>
  );
}

export function createMarkdownComponents(isDark: boolean): Components {
  const tableSurfaceClass = isDark
    ? 'border-surface-800 bg-surface-950/30'
    : 'border-surface-200 bg-white shadow-sm';
  const tableHeaderClass = isDark
    ? 'border-surface-700 bg-surface-900/90 text-surface-100'
    : 'border-surface-200 bg-surface-50 text-surface-900';
  const tableCellClass = isDark
    ? 'border-surface-800 text-surface-300'
    : 'border-surface-200 text-surface-700';
  const tableBodyClass = isDark ? 'divide-y divide-surface-800' : 'divide-y divide-surface-200/80';

  return {
    p: ({ children, className, node }) => {
      const standaloneLink = extractStandaloneLink(children);
      if (standaloneLink && getVideoEmbedConfig(standaloneLink)) {
        return <VideoEmbed url={standaloneLink} />;
      }
      if (standaloneLink && VIDEO_FILE_PATTERN.test(standaloneLink)) {
        return <VideoPlayer src={standaloneLink} />;
      }

      if (normalizeClassName(className).includes('md-image-grid')) {
        const imgNodes = extractImageNodes(node);
        if (imgNodes.length >= 2) {
          return <ImageGrid imgNodes={imgNodes} />;
        }
      }
      if (hasOnlyImages(node)) {
        return <div className="my-8">{children}</div>;
      }

      return <p>{children}</p>;
    },
    div: ({ children, className, node }) => {
      const classStr = normalizeClassName(className);
      if (classStr.includes('md-image-grid')) {
        const imgNodes = extractImageNodes(node);
        if (imgNodes.length >= 2) {
          return <ImageGrid imgNodes={imgNodes} />;
        }
      }
      return <div className={classStr}>{children}</div>;
    },
    a: ({ href, children }) => {
      const isInternal = href && (href.startsWith('/') || href.startsWith('#'));
      if (isInternal) {
        const isAgentSourceLink = href.includes('chat=open');
        return (
          <Link
            href={href}
            className={
              isAgentSourceLink
                ? 'mx-0.5 inline-flex items-center rounded-md border border-cyan-200 bg-cyan-50 px-1.5 py-0.5 text-[0.72em] font-black no-underline transition hover:border-cyan-500 hover:bg-cyan-100'
                : undefined
            }
          >
            {children}
          </Link>
        );
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    },
    strong: ({ children }) => <strong className="markdown-strong">{children}</strong>,
    code(props) {
      const { className, children } = props;
      return <MarkdownCodeBlock className={className} isDark={isDark}>{children}</MarkdownCodeBlock>;
    },
    img: ({ src, alt }) => (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={src}
        alt={alt || ''}
        className="w-full rounded-2xl border border-white/10 shadow-lg"
        loading="lazy"
      />
    ),
    table: ({ children }) => (
      <div className={`not-prose my-8 overflow-x-auto rounded-2xl border ${tableSurfaceClass}`}>
        <table className="m-0 w-full min-w-[720px] border-separate border-spacing-0 text-sm leading-6">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => <thead>{children}</thead>,
    tbody: ({ children }) => <tbody className={tableBodyClass}>{children}</tbody>,
    tr: ({ children }) => <tr>{children}</tr>,
    th: ({ children }) => (
      <th
        className={`whitespace-nowrap border-b border-r px-4 py-3 text-left text-xs font-black uppercase tracking-[0.12em] last:border-r-0 ${tableHeaderClass}`}
      >
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td
        className={`border-r px-4 py-3 align-top last:border-r-0 ${tableCellClass}`}
      >
        {children}
      </td>
    ),
  };
}
