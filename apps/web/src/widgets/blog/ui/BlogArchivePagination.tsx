import Link from 'next/link';
import { getBlogArchivePath, MAX_BLOG_ARCHIVE_PAGES } from '../lib/blogArchivePage';

interface BlogArchivePaginationProps {
  page: number;
  totalPages: number;
}

const LINK_CLASS =
  'rounded-xl border border-surface-200 bg-white px-3 py-2 text-sm font-bold text-surface-600 hover:border-surface-400 hover:text-surface-900';

export function BlogArchivePagination({ page, totalPages }: BlogArchivePaginationProps) {
  if (totalPages <= 1) return null;
  const lastPage = Math.min(totalPages, MAX_BLOG_ARCHIVE_PAGES);
  const start = Math.max(1, Math.min(page - 2, lastPage - 4));
  const pages = Array.from({ length: Math.min(5, lastPage) }, (_, index) => start + index);

  return (
    <nav aria-label="블로그 페이지" className="flex flex-wrap items-center justify-center gap-2">
      {page > 1 && (
        <Link
          href={getBlogArchivePath(page - 1)}
          prefetch={false}
          className={LINK_CLASS}
          rel="prev"
        >
          이전 페이지
        </Link>
      )}
      <BlogArchivePageRange pages={pages} page={page} lastPage={lastPage} />
      {page < lastPage && (
        <Link
          href={getBlogArchivePath(page + 1)}
          prefetch={false}
          className={LINK_CLASS}
          rel="next"
        >
          다음 페이지
        </Link>
      )}
    </nav>
  );
}

function BlogArchivePageRange({
  pages,
  page,
  lastPage,
}: {
  pages: number[];
  page: number;
  lastPage: number;
}) {
  const firstVisiblePage = pages[0] ?? page;
  const lastVisiblePage = pages.at(-1) ?? page;

  return (
    <>
      {firstVisiblePage > 1 && <BlogArchivePageLink number={1} page={page} />}
      {firstVisiblePage > 2 && <BlogArchivePageGap />}
      {pages.map(number => (
        <BlogArchivePageLink key={number} number={number} page={page} />
      ))}
      {lastVisiblePage < lastPage - 1 && <BlogArchivePageGap />}
      {lastVisiblePage < lastPage && <BlogArchivePageLink number={lastPage} page={page} />}
    </>
  );
}

function BlogArchivePageGap() {
  return (
    <span aria-hidden="true" className="px-1 text-surface-400">
      …
    </span>
  );
}

function BlogArchivePageLink({ number, page }: { number: number; page: number }) {
  if (number === page) {
    return (
      <span
        aria-current="page"
        className="rounded-xl bg-surface-900 px-3 py-2 text-sm font-bold text-white"
      >
        {number}
      </span>
    );
  }
  return (
    <Link
      href={getBlogArchivePath(number)}
      prefetch={false}
      aria-label={`${number}페이지로 이동`}
      className={LINK_CLASS}
    >
      {number}
    </Link>
  );
}
