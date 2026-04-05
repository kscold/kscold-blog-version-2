'use client';

import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateFeed, useLinkPreview } from '@/entities/feed/api/useFeeds';
import { useMediaUpload } from '@/shared/lib/useMediaUpload';
import { LinkPreviewCard } from '@/shared/ui/LinkPreviewCard';
import { useAlert } from '@/shared/model/alertStore';
import { ImagePreviewScroll } from './ImagePreviewScroll';
import type { User } from '@/types/user';

interface FeedComposerProps {
  currentUser: User | null;
}

export function FeedComposer({ currentUser }: FeedComposerProps) {
  const createFeed = useCreateFeed();
  const alert = useAlert();
  const { uploadFiles, isUploading } = useMediaUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [linkUrl, setLinkUrl] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: linkPreview } = useLinkPreview(linkUrl);

  const hasDraft = content.trim().length > 0 || images.length > 0 || linkUrl.trim().length > 0;
  const shouldShowExpanded = isExpanded || hasDraft;

  const initials = useMemo(() => {
    if (!currentUser) return '';
    return currentUser.displayName.charAt(0).toUpperCase();
  }, [currentUser]);

  if (!currentUser) return null;

  const handleImageUpload = async (files: FileList) => {
    try {
      const uploaded = await uploadFiles(files);
      setImages(prev => [...prev, ...uploaded]);
      setIsExpanded(true);
    } catch (err) {
      alert.error(err instanceof Error ? err.message : '업로드 실패');
    }
  };

  const handleReset = () => {
    setContent('');
    setImages([]);
    setLinkUrl('');
    setIsExpanded(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) {
      alert.warning('내용 또는 이미지를 입력해주세요');
      return;
    }

    try {
      await createFeed.mutateAsync({
        content,
        images,
        visibility: 'PUBLIC',
        linkUrl: linkUrl || undefined,
      });
      handleReset();
      alert.success('피드가 게시되었습니다');
    } catch (err) {
      alert.error(err instanceof Error ? err.message : '피드 생성 실패');
    }
  };

  return (
    <motion.section
      data-cy="feed-composer"
      className="mb-8 overflow-hidden rounded-[32px] border border-surface-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.06)]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="border-b border-surface-200 bg-surface-50/80 px-5 py-5 sm:px-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-surface-900 text-base font-black text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-surface-400">
                  Share a Note
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-surface-900 sm:text-3xl">
                  {currentUser.displayName}님, 지금의 흐름을 남겨보세요
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-surface-200 bg-white px-3 py-1 text-xs font-semibold text-surface-500">
                  공개 피드
                </span>
                <span className="rounded-full border border-surface-200 bg-white px-3 py-1 text-xs font-semibold text-surface-500">
                  이미지 · 링크 지원
                </span>
              </div>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-surface-500">
              짧은 문장, 작업 캡처, 참고 링크를 한 흐름으로 남길 수 있는 피드 작성 공간을
              제공합니다.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 px-5 py-6 sm:px-6 sm:py-7">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-surface-200 bg-surface-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-surface-400">Flow</p>
            <p className="mt-2 text-base font-semibold text-surface-900">짧고 빠르게</p>
            <p className="mt-1 text-sm text-surface-500">
              부담 없이 지금의 생각과 진행 상황을 바로 남길 수 있습니다.
            </p>
          </div>
          <div className="rounded-2xl border border-surface-200 bg-surface-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-surface-400">Media</p>
            <p className="mt-2 text-base font-semibold text-surface-900">붙여넣기 업로드</p>
            <p className="mt-1 text-sm text-surface-500">
              이미지를 붙여넣거나 드래그해 바로 첨부할 수 있습니다.
            </p>
          </div>
          <div className="rounded-2xl border border-surface-200 bg-surface-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-surface-400">Link</p>
            <p className="mt-2 text-base font-semibold text-surface-900">링크 카드 미리보기</p>
            <p className="mt-1 text-sm text-surface-500">
              공유할 자료가 있다면 링크 설명까지 함께 묶어둘 수 있습니다.
            </p>
          </div>
        </div>

        <div
          className="rounded-[28px] border border-surface-200 bg-white p-5 sm:p-6"
          onDragOver={e => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={async e => {
            e.preventDefault();
            if (e.dataTransfer?.files?.length) await handleImageUpload(e.dataTransfer.files);
          }}
        >
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-surface-900">피드 본문</p>
              <p className="mt-1 text-sm text-surface-500">
                오늘 만들고 있는 것, 배운 점, 공유하고 싶은 링크의 맥락을 적어 주세요.
              </p>
            </div>
            <span className="rounded-full border border-surface-200 bg-surface-50 px-3 py-1 text-xs font-semibold text-surface-500">
              {content.trim().length}자
            </span>
          </div>

          <textarea
            value={content}
            onChange={e => {
              setContent(e.target.value);
              if (!isExpanded) setIsExpanded(true);
            }}
            onFocus={() => setIsExpanded(true)}
            onPaste={async e => {
              const files = e.clipboardData?.files;
              if (files?.length) {
                const imagesToUpload = Array.from(files).filter(file => file.type.startsWith('image/'));
                if (imagesToUpload.length) {
                  e.preventDefault();
                  const dataTransfer = new DataTransfer();
                  imagesToUpload.forEach(file => dataTransfer.items.add(file));
                  await handleImageUpload(dataTransfer.files);
                }
              }
            }}
            placeholder="지금 떠오른 생각, 작업 진행 상황, 링크를 공유하고 싶은 이유를 편하게 적어보세요."
            rows={shouldShowExpanded ? 8 : 3}
            data-cy="feed-composer-content"
            className="min-h-[140px] w-full resize-none border-0 bg-transparent p-0 text-base leading-8 text-surface-900 placeholder:text-surface-300 focus:outline-none sm:min-h-[180px] sm:text-[1.05rem]"
          />

          <p className="mt-4 text-sm text-surface-400">
            이미지를 이 영역에 드래그하거나 붙여넣으면 바로 첨부됩니다.
          </p>
        </div>

        <AnimatePresence initial={false}>
          {shouldShowExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-5 overflow-hidden"
            >
              <div className="rounded-[28px] border border-surface-200 bg-surface-50/70 p-5 sm:p-6">
                {images.length > 0 ? (
                  <ImagePreviewScroll
                    images={images}
                    onRemove={index => setImages(prev => prev.filter((_, idx) => idx !== index))}
                    dataCy="feed-composer-images"
                  />
                ) : (
                  <div
                    data-cy="feed-composer-images"
                    className="rounded-[24px] border border-dashed border-surface-200 bg-white px-5 py-8 text-center"
                  >
                    <p className="text-base font-semibold text-surface-900">아직 첨부된 이미지가 없습니다</p>
                    <p className="mt-2 text-sm leading-relaxed text-surface-500">
                      아래 버튼으로 이미지를 추가하거나, 본문에 붙여넣어서 바로 업로드할 수
                      있습니다.
                    </p>
                  </div>
                )}
              </div>

              <div
                data-cy="feed-composer-link"
                className="rounded-[28px] border border-surface-200 bg-surface-50/70 p-5 sm:p-6"
              >
                <div className="mb-3">
                  <p className="text-sm font-semibold text-surface-900">링크 미리보기</p>
                  <p className="mt-1 text-sm text-surface-500">
                    참고 자료나 공유하고 싶은 페이지가 있다면 링크와 함께 남겨 주세요.
                  </p>
                </div>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={e => {
                    setLinkUrl(e.target.value);
                    if (!isExpanded) setIsExpanded(true);
                  }}
                  placeholder="https://example.com"
                  data-cy="feed-composer-link-input"
                  className="w-full rounded-2xl border border-surface-200 bg-white px-4 py-3 text-sm text-surface-700 placeholder:text-surface-400 focus:outline-none focus:ring-1 focus:ring-surface-900"
                />
                {linkPreview?.title && (
                  <div className="mt-4">
                    <LinkPreviewCard preview={linkPreview} />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-3 rounded-[28px] border border-surface-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              data-cy="feed-composer-upload"
              disabled={isUploading}
              className="inline-flex items-center gap-2 rounded-full border border-surface-200 bg-surface-50 px-4 py-2 text-sm font-semibold text-surface-700 transition-colors hover:bg-surface-100 hover:text-surface-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z"
                />
              </svg>
              {isUploading ? '이미지 업로드 중...' : '이미지 추가'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={e => e.target.files && handleImageUpload(e.target.files)}
              className="hidden"
              data-cy="feed-composer-upload-input"
            />

            <button
              type="button"
              onClick={() => setIsExpanded(prev => !prev)}
              data-cy="feed-composer-toggle"
              className="inline-flex items-center gap-2 rounded-full border border-surface-200 bg-white px-4 py-2 text-sm font-semibold text-surface-500 transition-colors hover:text-surface-900"
            >
              {shouldShowExpanded ? '보조 패널 접기' : '링크와 이미지 패널 열기'}
            </button>

            {hasDraft && (
              <button
                type="button"
                onClick={handleReset}
                data-cy="feed-composer-reset"
                className="inline-flex items-center gap-2 rounded-full border border-surface-200 bg-white px-4 py-2 text-sm font-semibold text-surface-400 transition-colors hover:text-surface-700"
              >
                초안 비우기
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            data-cy="feed-composer-submit"
            disabled={createFeed.isPending || (!content.trim() && images.length === 0)}
            className="inline-flex items-center justify-center rounded-full bg-surface-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-surface-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createFeed.isPending ? '게시 중...' : '피드 게시하기'}
          </button>
        </div>
      </div>
    </motion.section>
  );
}
