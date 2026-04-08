'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateFeed, useLinkPreview, useUpdateFeed } from '@/entities/feed/api/useFeeds';
import { useMediaUpload } from '@/shared/lib/useMediaUpload';
import { useAlert } from '@/shared/model/alertStore';

interface UseFeedEditorOptions {
  feedId?: string;
  initialContent?: string;
  initialImages?: string[];
  initialVisibility?: 'PUBLIC' | 'PRIVATE';
  initialLinkUrl?: string;
}

export function useFeedEditor({
  feedId,
  initialContent = '',
  initialImages = [],
  initialVisibility = 'PUBLIC',
  initialLinkUrl = '',
}: UseFeedEditorOptions) {
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

  async function handleImageUpload(files: FileList) {
    try {
      const uploadedUrls = await uploadFiles(files);
      setImages(prev => [...prev, ...uploadedUrls]);
    } catch (err) {
      const message = err instanceof Error ? err.message : '업로드에 실패했습니다';
      alert.error(message);
    }
  }

  function removeImage(index: number) {
    setImages(prev => prev.filter((_, currentIndex) => currentIndex !== index));
  }

  async function handleSubmit() {
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
  }

  async function handlePaste(event: React.ClipboardEvent<HTMLTextAreaElement>) {
    const files = event.clipboardData?.files;
    if (!files?.length) return;

    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (!imageFiles.length) return;

    event.preventDefault();
    const dataTransfer = new DataTransfer();
    imageFiles.forEach(file => dataTransfer.items.add(file));
    await handleImageUpload(dataTransfer.files);
  }

  async function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files?.length) {
      await handleImageUpload(files);
    }
  }

  return {
    feedId,
    content,
    images,
    visibility,
    linkUrl,
    linkPreview,
    isUploading,
    isPending: feedId ? updateFeed.isPending : createFeed.isPending,
    setContent,
    setVisibility,
    setLinkUrl,
    handleImageUpload,
    handlePaste,
    handleDrop,
    handleSubmit,
    removeImage,
  };
}
