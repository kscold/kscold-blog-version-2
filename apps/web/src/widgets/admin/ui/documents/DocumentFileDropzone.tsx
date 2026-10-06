'use client';

import { useRef, useState } from 'react';
import Button from '@/shared/ui/Button';
import { DOCUMENT_ACCEPT } from '../../lib/adminDocuments';

interface DocumentFileDropzoneProps {
  disabled: boolean;
  onFiles: (files: File[]) => void;
}

export function DocumentFileDropzone({ disabled, onFiles }: DocumentFileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  return (
    <div
      data-testid="admin-documents-dropzone"
      onDragOver={event => {
        event.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={event => {
        if (
          !(event.relatedTarget instanceof Node) ||
          !event.currentTarget.contains(event.relatedTarget)
        )
          setIsDragging(false);
      }}
      onDrop={event => {
        event.preventDefault();
        setIsDragging(false);
        if (!disabled) onFiles(Array.from(event.dataTransfer.files));
      }}
      className={`rounded-2xl border-2 border-dashed px-5 py-7 text-center transition-colors ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-surface-200 bg-surface-50'} ${disabled ? 'opacity-60' : ''}`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={DOCUMENT_ACCEPT}
        disabled={disabled}
        className="sr-only"
        aria-label="개인 문서 파일 선택"
        data-testid="admin-documents-file-input"
        onChange={event => {
          if (event.target.files?.length) onFiles(Array.from(event.target.files));
          event.target.value = '';
        }}
      />
      <svg
        aria-hidden="true"
        className="mx-auto mb-3 h-7 w-7 text-surface-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M12 16V3m0 0L7 8m5-5 5 5M4 15v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5" />
      </svg>
      <p className="text-sm font-semibold text-surface-900">파일을 여기로 끌어 놓으세요</p>
      <p className="mt-1 text-xs leading-5 text-surface-500">
        여러 파일 선택 가능 · 파일당 최대 10 MB
      </p>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-4 bg-white"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        파일 선택
      </Button>
    </div>
  );
}
