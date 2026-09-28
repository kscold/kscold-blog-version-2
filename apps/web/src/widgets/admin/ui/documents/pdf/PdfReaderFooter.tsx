interface PdfReaderFooterProps {
  pageCount: number;
  pageNumber: number;
}

export function PdfReaderFooter({ pageCount, pageNumber }: PdfReaderFooterProps) {
  return (
    <footer
      className="flex shrink-0 items-center justify-between gap-3 border-t border-surface-200 bg-white px-4 py-2 text-xs text-surface-500"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <span className="sm:hidden">두 손가락으로 확대 · 위아래로 읽기</span>
      <span className="hidden sm:inline">드래그로 텍스트 선택 · 페이지 번호를 입력해 이동</span>
      <span className="shrink-0 tabular-nums">
        {pageCount ? `${pageNumber} / ${pageCount} 페이지` : '비공개 문서'}
      </span>
    </footer>
  );
}
