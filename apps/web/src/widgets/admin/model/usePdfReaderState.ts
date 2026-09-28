'use client';

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { pdfjs } from 'react-pdf';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { usePdfNavigation } from './usePdfNavigation';
import { usePdfViewport } from './usePdfViewport';
import { usePdfPinchZoom } from './usePdfPinchZoom';

interface PdfReaderPasswordRequest {
  onPassword: (password: string) => void;
  isIncorrect: boolean;
}

interface PdfReaderDocumentOptions {
  bytes: Uint8Array;
  onPages: (pageCount: number) => void;
}

function usePdfReaderDocument({ bytes, onPages }: PdfReaderDocumentOptions) {
  const [error, setError] = useState('');
  const [passwordRequest, setPasswordRequest] = useState<PdfReaderPasswordRequest | null>(null);
  const file = useMemo(() => ({ data: bytes }), [bytes]);
  const onPassword = useCallback((callback: (password: string) => void, reason: number) => {
    setPasswordRequest({
      onPassword: callback,
      isIncorrect: reason === pdfjs.PasswordResponses.INCORRECT_PASSWORD,
    });
  }, []);
  function onLoad(pdf: PDFDocumentProxy) {
    setPasswordRequest(null);
    onPages(pdf.numPages);
  }
  return {
    error,
    file,
    passwordRequest,
    onPassword,
    onLoad,
    reportLoadError: () =>
      setError('PDF를 읽을 수 없습니다. 파일이 손상되었거나 지원하지 않는 형식일 수 있습니다.'),
    reportSourceError: () => setError('PDF 원본을 읽지 못했습니다. 다시 시도해 주세요.'),
  };
}

export function usePdfReaderState(bytes: Uint8Array) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigation = usePdfNavigation(scrollRef);
  const { goToPage } = navigation;
  const fitWidth = usePdfViewport(scrollRef);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const document = usePdfReaderDocument({ bytes, onPages: navigation.setPageCount });
  const pageWidth = Math.round(fitWidth * scale);
  const currentPage = useRef(navigation.pageNumber);
  currentPage.current = navigation.pageNumber;
  usePdfPinchZoom({ scrollRef, scale, onScale: setScale });
  useLayoutEffect(() => {
    goToPage(currentPage.current);
  }, [pageWidth, rotation, goToPage]);
  return {
    scrollRef,
    navigation,
    fitWidth,
    scale,
    setScale,
    rotation,
    rotate: () => setRotation(value => (value + 90) % 360),
    document,
    pageWidth,
  };
}

export type PdfReaderState = ReturnType<typeof usePdfReaderState>;
