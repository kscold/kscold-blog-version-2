'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useCreateFeed, useUpdateFeed, useLinkPreview } from '@/entities/feed/api/useFeeds';
import { LinkPreviewCard } from '@/shared/ui/LinkPreviewCard';
import { useMediaUpload } from '@/shared/lib/useMediaUpload';
import FeedActionBar from '@/widgets/feed/ui/FeedActionBar';
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
      setImages([...images, ...uploadedUrls]);
    } catch (err) {
      const message = err instanceof Error ? err.message : '업로드에 실패했습니다';
      alert.error(message);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
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
      <div className="max-w-xl mx-auto px-4 py-8">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/admin/feed"
            className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-900 transition-colors font-medium mb-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            피드 관리로 돌아가기
          </Link>
          <h1 className="text-3xl font-sans font-black tracking-tighter text-surface-900">
            {feedId ? '피드 수정' : '새 피드 작성'}
          </h1>
        </motion.div>

        <motion.div
          className="max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="bg-white border border-surface-200 rounded-2xl overflow-hidden">
            {images.length > 0 && (
              <div className="p-4 border-b border-surface-100">
                <div className="grid grid-cols-3 gap-2">
                  {images.map((url, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-lg overflow-hidden bg-surface-100"
                    >
                      <Image src={url} alt="" fill sizes="33vw" className="object-cover" />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4">
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="오늘 하루는 어땠나요?"
                rows={4}
                className="w-full resize-none text-sm text-surface-900 placeholder-surface-400 focus:outline-none"
              />
            </div>

            <div className="px-4 pb-3">
              <input
                type="url"
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                placeholder="링크 URL (선택)"
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-surface-400 bg-surface-50"
              />
              {linkPreview && linkPreview.title && (
                <div className="mt-2">
                  <LinkPreviewCard preview={linkPreview} />
                </div>
              )}
            </div>

            <FeedActionBar
              visibility={visibility}
              isUploading={isUploading}
              isPending={isPending}
              isSubmitDisabled={!content.trim() && images.length === 0}
              onToggleVisibility={() => setVisibility(visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC')}
              onImageUpload={handleImageUpload}
              onSubmit={handleSubmit}
              submitLabel={feedId ? '수정하기' : '게시하기'}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
