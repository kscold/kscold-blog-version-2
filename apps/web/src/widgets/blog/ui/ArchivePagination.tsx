import Link from 'next/link';
import { getArchivePagePath, MAX_ARCHIVE_PAGES } from '../lib/archivePage';

interface ArchivePaginationProps {
  basePath: string;
  page: number;
  totalPages: number;
  ariaLabel: string;
}

const LINK_CLASS =
  'rounded-xl border border-surface-200 bg-white px-3 py-2 text-sm font-bold text-surface-600 hover:border-surface-400 hover:text-surface-900';

export function ArchivePagination({ basePath, page, totalPages, ariaLabel }: ArchivePaginationProps) {
  if (totalPages <= 1) return null;
  const lastPage = Math.min(totalPages, MAX_ARCHIVE_PAGES);
  const start = Math.max(1, Math.min(page - 2, lastPage - 4));
  const pages = Array.from({ length: Math.min(5, lastPage) }, (_, index) => start + index);

  return (
    <nav aria-label={ariaLabel} className="flex flex-wrap items-center justify-center gap-2">
      {page > 1 && (
        <ArchivePageLink basePath={basePath} number={page - 1} label="이전 페이지" rel="prev" />
      )}
      <ArchivePageRange basePath={basePath} pages={pages} page={page} lastPage={lastPage} />
      {page < lastPage && (
        <ArchivePageLink basePath={basePath} number={page + 1} label="다음 페이지" rel="next" />
      )}
    </nav>
  );
}

function ArchivePageRange({
  basePath,
  pages,
  page,
  lastPage,
}: {
  basePath: string;
  pages: number[];
  page: number;
  lastPage: number;
}) {
  const firstVisiblePage = pages[0] ?? page;
  const lastVisiblePage = pages.at(-1) ?? page;
  return (
    <>
      {firstVisiblePage > 1 && <ArchivePageNumber basePath={basePath} number={1} page={page} />}
      {firstVisiblePage > 2 && <ArchivePageGap />}
      {pages.map(number => (
        <ArchivePageNumber key={number} basePath={basePath} number={number} page={page} />
      ))}
      {lastVisiblePage < lastPage - 1 && <ArchivePageGap />}
      {lastVisiblePage < lastPage && (
        <ArchivePageNumber basePath={basePath} number={lastPage} page={page} />
      )}
    </>
  );
}

function ArchivePageGap() {
  return <span aria-hidden="true" className="px-1 text-surface-400">…</span>;
}

function ArchivePageNumber({ basePath, number, page }: { basePath: string; number: number; page: number }) {
  if (number === page) {
    return <span aria-current="page" className="rounded-xl bg-surface-900 px-3 py-2 text-sm font-bold text-white">{number}</span>;
  }
  return <ArchivePageLink basePath={basePath} number={number} label={`${number}페이지로 이동`} />;
}

function ArchivePageLink({
  basePath,
  number,
  label,
  rel,
}: {
  basePath: string;
  number: number;
  label: string;
  rel?: 'prev' | 'next';
}) {
  return (
    <Link href={getArchivePagePath(basePath, number)} prefetch={false} aria-label={label} className={LINK_CLASS} rel={rel}>
      {label === '이전 페이지' || label === '다음 페이지' ? label : number}
    </Link>
  );
}
