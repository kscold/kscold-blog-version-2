'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  canSubmitFeed,
  getFeedContentError,
  getFeedImageCountError,
  getFeedLinkUrlError,
  normalizeFeedLinkUrl,
  useLinkPreview,
} from '@/entities/feed';
import { useCreateFeed, useUpdateFeed } from '@/features/feed/api/useFeedMutations';
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
  const isImageUploadActiveRef = useRef(false);

  const [content, setContent] = useState(initialContent);
  const [images, setImages] = useState<string[]>(initialImages);
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>(initialVisibility);
  const [linkUrl, setLinkUrl] = useState(initialLinkUrl);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  const { data: linkPreview } = useLinkPreview(linkUrl);
  const contentError = getFeedContentError(content);
  const linkError = getFeedLinkUrlError(linkUrl);
  const imageCountError = getFeedImageCountError(images.length);
  const imageError = imageUploadError ?? imageCountError;
  const canSubmit = canSubmitFeed({ content, imageCount: images.length, linkUrl });

  async function handleImageUpload(files: FileList) {
    const nextImageError = getFeedImageCountError(images.length, files.length);
    if (nextImageError) {
      setImageUploadError(nextImageError);
      alert.warning(nextImageError);
      return;
    }
    if (isImageUploadActiveRef.current) {
      alert.warning('진행 중인 이미지 업로드가 끝난 뒤 다시 시도해주세요.');
      return;
    }

    setImageUploadError(null);
    isImageUploadActiveRef.current = true;
    try {
      const uploadedUrls = await uploadFiles(files);
      setImages(prev => [...prev, ...uploadedUrls]);
    } catch (err) {
      const message = err instanceof Error ? err.message : '업로드에 실패했습니다';
      alert.error(message);
    } finally {
      isImageUploadActiveRef.current = false;
    }
  }

  function removeImage(index: number) {
    setImages(prev => prev.filter((_, currentIndex) => currentIndex !== index));
    setImageUploadError(null);
  }

  async function handleSubmit() {
    if (!content.trim() && images.length === 0) {
      alert.warning('내용 또는 이미지를 입력해주세요');
      return;
    }
    const inputError = contentError ?? imageCountError ?? linkError;
    if (inputError) {
      alert.warning(inputError);
      return;
    }
    if (isUploading || isImageUploadActiveRef.current) {
      alert.warning('이미지 업로드가 끝난 뒤 저장해주세요.');
      return;
    }

    try {
      const normalizedLinkUrl = normalizeFeedLinkUrl(linkUrl);
      if (feedId) {
        await updateFeed.mutateAsync({
          id: feedId,
          data: { content, images, visibility, linkUrl: normalizedLinkUrl },
        });
      } else {
        await createFeed.mutateAsync({
          content,
          images,
          visibility,
          linkUrl: normalizedLinkUrl || undefined,
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
    contentError,
    imageError,
    linkError,
    canSubmit,
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
