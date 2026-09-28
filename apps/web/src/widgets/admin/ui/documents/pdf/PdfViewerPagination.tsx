'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Button from '@/shared/ui/Button';

interface PaginationProps {
  pageCount: number;
  pageNumber: number;
  onPage: (page: number) => void;
}

function PdfPageInput({ pageCount, pageNumber, onPage }: PaginationProps) {
  const [input, setInput] = useState(String(pageNumber));
  useEffect(() => setInput(String(pageNumber)), [pageNumber]);
  function submit(event: FormEvent) {
    event.preventDefault();
    onPage(Number(input));
    setInput(String(Math.max(1, Math.min(pageCount, Number(input) || pageNumber))));
  }
  return (
    <form onSubmit={submit} className="flex items-center gap-2 text-xs text-surface-600">
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={pageCount || 1}
        value={input}
        disabled={!pageCount}
        onChange={event => setInput(event.target.value)}
        aria-label="PDF 페이지 번호"
        data-cy="pdf-viewer-page-input"
        className="h-11 w-14 rounded-lg border border-surface-200 bg-white px-2 text-center text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-surface-900"
      />
      <span className="whitespace-nowrap" data-cy="pdf-viewer-page-count">
        / {pageCount || '—'}
      </span>
      <button type="submit" className="sr-only" disabled={!pageCount}>
        페이지 이동
      </button>
    </form>
  );
}

export function PdfViewerPagination({ pageCount, pageNumber, onPage }: PaginationProps) {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Button
        variant="ghost"
        size="sm"
        className="min-h-11 min-w-11 px-2"
        aria-label="이전 페이지"
        disabled={!pageCount || pageNumber <= 1}
        onClick={() => onPage(pageNumber - 1)}
        data-cy="pdf-viewer-previous"
      >
        ←
      </Button>
      <PdfPageInput pageCount={pageCount} pageNumber={pageNumber} onPage={onPage} />
      <Button
        variant="ghost"
        size="sm"
        className="min-h-11 min-w-11 px-2"
        aria-label="다음 페이지"
        disabled={!pageCount || pageNumber >= pageCount}
        onClick={() => onPage(pageNumber + 1)}
        data-cy="pdf-viewer-next"
      >
        →
      </Button>
    </div>
  );
}
