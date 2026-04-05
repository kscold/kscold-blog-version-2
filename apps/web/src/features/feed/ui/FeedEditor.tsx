'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useCreateFeed, useUpdateFeed, useLinkPreview } from '@/entities/feed/api/useFeeds';
import { LinkPreviewCard } from '@/shared/ui/LinkPreviewCard';
import { useMediaUpload } from '@/shared/lib/useMediaUpload';
import FeedActionBar from '@/features/feed/ui/FeedActionBar';
import { ImagePreviewGrid } from './ImagePreviewGrid';
import { useAlert } from '@/shared/model/alertStore';

interface FeedEditorProps {
  feedId?: string;
  initialContent?: string;
  initialImages?: string[];
  initialVisibility?: 'PUBLIC' | 'PRIVATE';
  initialLinkUrl?: string;
}

export default function FeedEditor({
  feedId,
  initialContent = '',
  initialImages = [],
  initialVisibility = 'PUBLIC',
  initialLinkUrl = '',
}: FeedEditorProps) {
  const router = useRouter();
  const createFeed = useCreateFeed();
  const updateFeed = useUpdateFeed();
  const alert = useAlert();
  const { uploadFiles, isUploading } = useMediaUpload();

  const [content, setContent] = useState(initialContent);
  const [images, setImages] = useState<string[]>(initialImages);
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>(initialVisibility);
  const [linkUrl, setLinkUrl] = useState(initialLinkUrl);

  const { data: linkPreview } = useLinkPreview(linkUrl);

  const handleImageUpload = async (files: FileList) => {
    try {
      const uploadedUrls = await uploadFiles(files);
      setImages(prev => [...prev, ...uploadedUrls]);
    } catch (err) {
      const message = err instanceof Error ? err.message : '업로드에 실패했습니다';
      alert.error(message);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) {
      alert.warning('내용 또는 이미지를 입력해주세요');
      return;
    }

    try {
      if (feedId) {
        await updateFeed.mutateAsync({
          id: feedId,
          data: { content, images, visibility, linkUrl: linkUrl || undefined },
        });
      } else {
        await createFeed.mutateAsync({
          content,
          images,
          visibility,
          linkUrl: linkUrl || undefined,
        });
      }

      router.push('/admin/feed');
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : feedId
            ? '피드 수정에 실패했습니다'
            : '피드 생성에 실패했습니다';
      alert.error(message);
    }
  };

  const isPending = feedId ? updateFeed.isPending : createFeed.isPending;

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/admin/feed"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-surface-500 transition-colors hover:text-surface-900"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            피드 관리로 돌아가기
          </Link>
          <h1 className="text-3xl font-sans font-black tracking-tighter text-surface-900">
            {feedId ? '피드 수정' : '새 피드 작성'}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-surface-500 sm:text-base">
            노션처럼 본문, 이미지, 링크를 한 흐름으로 정리한 피드 작성 화면입니다. 폰과
            데스크톱 어디서든 같은 감각으로 짧은 기록을 남길 수 있게 구성했습니다.
          </p>
        </motion.div>

        <motion.div
          className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <section
            data-cy="feed-editor-surface"
            className="overflow-hidden rounded-[32px] border border-surface-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.06)]"
          >
            <div className="border-b border-surface-200 bg-surface-50/80 px-5 py-5 sm:px-8">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-surface-400">
                  Writing Flow
                </p>
                <h2 className="text-3xl font-black tracking-tight text-surface-900 sm:text-4xl">
                  {feedId ? '기록을 다듬고 있습니다' : '지금 떠오른 흐름을 남겨 보세요'}
                </h2>
                <p className="max-w-2xl text-sm leading-relaxed text-surface-500 sm:text-base">
                  본문을 먼저 쓰고, 필요한 이미지는 붙여넣거나 드래그해서 더해 주세요. 링크가
                  있다면 카드 미리보기까지 한 번에 확인할 수 있습니다.
                </p>
              </div>
            </div>

            <div className="space-y-6 px-5 py-6 sm:px-8 sm:py-8">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-surface-200 bg-surface-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-surface-400">
                    Flow
                  </p>
                  <p className="mt-2 text-base font-semibold text-surface-900">짧고 선명하게</p>
                  <p className="mt-1 text-sm text-surface-500">
                    긴 글보다 지금의 생각과 장면을 빠르게 남기는 데에 맞춘 화면입니다.
                  </p>
                </div>
                <div className="rounded-2xl border border-surface-200 bg-surface-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-surface-400">
                    Media
                  </p>
                  <p className="mt-2 text-base font-semibold text-surface-900">
                    붙여넣기와 드래그 업로드
                  </p>
                  <p className="mt-1 text-sm text-surface-500">
                    캡처나 이미지를 그대로 붙여넣어도 바로 업로드할 수 있습니다.
                  </p>
                </div>
                <div className="rounded-2xl border border-surface-200 bg-surface-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-surface-400">
                    Preview
                  </p>
                  <p className="mt-2 text-base font-semibold text-surface-900">
                    링크 카드까지 한 화면에서
                  </p>
                  <p className="mt-1 text-sm text-surface-500">
                    외부 링크가 있으면 미리보기를 보면서 맥락을 함께 정리할 수 있습니다.
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
                  const files = e.dataTransfer?.files;
                  if (files && files.length > 0) await handleImageUpload(files);
                }}
              >
                <div className="mb-4">
                  <p className="text-sm font-semibold text-surface-900">본문</p>
                  <p className="mt-1 text-sm text-surface-500">
                    오늘 공유하고 싶은 생각이나 작업 맥락을 자유롭게 적어 주세요.
                  </p>
                </div>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  onPaste={async e => {
                    const files = e.clipboardData?.files;
                    if (files && files.length > 0) {
                      const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
                      if (imageFiles.length > 0) {
                        e.preventDefault();
                        const fileList = new DataTransfer();
                        imageFiles.forEach(file => fileList.items.add(file));
                        await handleImageUpload(fileList.files);
                      }
                    }
                  }}
                  placeholder="방금 만들고 있는 것, 떠오른 생각, 공유하고 싶은 링크의 맥락을 편하게 적어보세요."
                  rows={10}
                  data-cy="feed-editor-content"
                  className="min-h-[260px] w-full resize-none border-0 bg-transparent p-0 text-lg leading-8 text-surface-900 placeholder:text-surface-300 focus:outline-none sm:text-[1.15rem]"
                />
                <p className="mt-4 text-sm text-surface-400">
                  이미지를 이 영역에 드래그하거나 붙여넣으면 바로 첨부됩니다.
                </p>
              </div>

              <div className="rounded-[28px] border border-surface-200 bg-surface-50/70 p-5 sm:p-6">
                {images.length > 0 ? (
                  <ImagePreviewGrid
                    images={images}
                    onRemove={removeImage}
                    dataCy="feed-editor-images"
                  />
                ) : (
                  <div
                    data-cy="feed-editor-images"
                    className="rounded-[24px] border border-dashed border-surface-200 bg-white px-5 py-8 text-center"
                  >
                    <p className="text-base font-semibold text-surface-900">
                      아직 첨부된 이미지가 없습니다
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-surface-500">
                      오른쪽 설정 패널에서 이미지를 추가하거나, 본문에 이미지를 붙여넣어 바로
                      업로드할 수 있습니다.
                    </p>
                  </div>
                )}
              </div>

              <div
                data-cy="feed-editor-link"
                className="rounded-[28px] border border-surface-200 bg-surface-50/70 p-5 sm:p-6"
              >
                <div className="mb-3">
                  <p className="text-sm font-semibold text-surface-900">링크 미리보기</p>
                  <p className="mt-1 text-sm text-surface-500">
                    참고 자료나 공유하고 싶은 서비스 링크를 붙여두면 카드 형태로 정리됩니다.
                  </p>
                </div>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={e => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  data-cy="feed-editor-link-input"
                  className="w-full rounded-2xl border border-surface-200 bg-white px-4 py-3 text-sm text-surface-700 placeholder:text-surface-400 focus:outline-none focus:ring-1 focus:ring-surface-900"
                />
                {linkPreview && linkPreview.title && (
                  <div className="mt-4">
                    <LinkPreviewCard preview={linkPreview} />
                  </div>
                )}
              </div>
            </div>
          </section>

          <FeedActionBar
            visibility={visibility}
            isUploading={isUploading}
            isPending={isPending}
            isSubmitDisabled={!content.trim() && images.length === 0}
            contentLength={content.trim().length}
            imageCount={images.length}
            hasLink={Boolean(linkUrl.trim())}
            onVisibilityChange={setVisibility}
            onImageUpload={handleImageUpload}
            onSubmit={handleSubmit}
            submitLabel={feedId ? '변경사항 저장' : '피드 게시'}
          />
        </motion.div>
      </div>
    </div>
  );
}
