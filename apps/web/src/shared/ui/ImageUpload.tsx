'use client';

import { useEffect, useState, useRef, DragEvent } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useMediaUpload } from '@/shared/lib/useMediaUpload';

interface ImageUploadProps {
  onUploadSuccess: (url: string) => void;
  currentImage?: string;
  dataCy?: string;
}

export function ImageUpload({ onUploadSuccess, currentImage, dataCy }: ImageUploadProps) {
  const { uploadFile, isUploading } = useMediaUpload();
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(currentImage || null);
  }, [currentImage]);

  const uploadSelectedFile = async (file: File) => {
    if (!file) return;

    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const url = await uploadFile(file);
      onUploadSuccess(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : '업로드에 실패했습니다';
      setError(message);
      setPreview(currentImage || null);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadSelectedFile(file);
  };

  const handleDrop = async (event: DragEvent<HTMLButtonElement | HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    await uploadSelectedFile(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.stopPropagation();
    setPreview(null);
    onUploadSuccess('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        data-cy={dataCy ? `${dataCy}-input` : undefined}
      />

      {preview ? (
        <div
          className="relative overflow-hidden rounded-[28px] border border-surface-200 bg-surface-900/5"
          data-cy={dataCy}
        >
          <div className="relative aspect-[16/8] sm:aspect-[16/7]">
          <Image src={preview} alt="Preview" fill sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-950/75 via-surface-950/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-white">
                <p className="text-sm font-semibold">커버 이미지</p>
                <p className="mt-1 text-xs text-white/70">
                  문서 상단에 표시됩니다. 클릭해서 교체하거나 제거할 수 있어요.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={event => {
                    event.stopPropagation();
                    handleClick();
                  }}
                  disabled={isUploading}
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-surface-900 transition-colors hover:bg-surface-100"
                >
                  변경
                </button>
                <button
                  onClick={handleRemove}
                  disabled={isUploading}
                  className="rounded-full border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                >
                  제거
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          onDragOver={event => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={event => void handleDrop(event)}
          disabled={isUploading}
          data-cy={dataCy}
          className={`w-full rounded-[28px] border border-dashed px-6 py-10 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            isDragging
              ? 'border-surface-900 bg-surface-100 shadow-[0_18px_40px_rgba(15,23,42,0.08)]'
              : 'border-surface-200 bg-surface-50 hover:border-surface-300 hover:bg-white'
          }`}
        >
          {isUploading ? (
            <button
              type="button"
              className="inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-semibold text-surface-900 shadow-sm"
            >
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-surface-300 border-t-surface-900" />
              업로드 중...
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                <svg
                  className="w-6 h-6 text-surface-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <div>
                <p className="text-base font-semibold text-surface-900">
                  커버 이미지를 추가해 주세요
                </p>
                <p className="mt-2 text-sm leading-relaxed text-surface-500">
                  클릭해서 업로드하거나, 이미지를 이 영역으로 드래그해 바로 넣을 수 있습니다.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-surface-400">
                <span className="rounded-full border border-surface-200 bg-white px-3 py-1">
                  JPG / PNG / GIF
                </span>
                <span className="rounded-full border border-surface-200 bg-white px-3 py-1">
                  최대 10MB
                </span>
              </div>
            </div>
          )}
        </button>
      )}

      {error && (
        <motion.div
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm text-red-600">{error}</p>
        </motion.div>
      )}
    </div>
  );
}
