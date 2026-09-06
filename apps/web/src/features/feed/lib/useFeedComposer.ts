'use client';

import { useMemo, useRef, useState } from 'react';
import {
  canSubmitFeed,
  getFeedContentError,
  getFeedImageCountError,
  getFeedLinkUrlError,
  normalizeFeedLinkUrl,
  useLinkPreview,
} from '@/entities/feed';
import { useCreateFeed } from '@/features/feed/api/useFeedMutations';
import { useMediaUpload } from '@/shared/lib/useMediaUpload';
import { useAlert } from '@/shared/model/alertStore';
import type { User } from '@/shared/model/types/user';

export function useFeedComposer(currentUser: User | null) {
  const createFeed = useCreateFeed();
  const alert = useAlert();
  const { uploadFiles, isUploading } = useMediaUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isImageUploadActiveRef = useRef(false);

  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [linkUrl, setLinkUrl] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  const { data: linkPreview } = useLinkPreview(linkUrl);
  const contentError = getFeedContentError(content);
  const linkError = getFeedLinkUrlError(linkUrl);
  const imageCountError = getFeedImageCountError(images.length);
  const imageError = imageUploadError ?? imageCountError;
  const canSubmit = canSubmitFeed({ content, imageCount: images.length, linkUrl });

  const hasDraft =
    content.trim().length > 0 || images.length > 0 || linkUrl.trim().length > 0;
  const shouldShowExpanded = isExpanded || hasDraft;
  const initials = useMemo(
    () => (currentUser ? currentUser.displayName.charAt(0).toUpperCase() : ''),
    [currentUser]
  );

  async function handleImageUpload(files: FileList) {
    const nextImageError = getFeedImageCountError(images.length, files.length);
    if (nextImageError) {
      setImageUploadError(nextImageError);
      setIsExpanded(true);
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
      const uploaded = await uploadFiles(files);
      setImages(prev => [...prev, ...uploaded]);
      setIsExpanded(true);
    } catch (err) {
      alert.error(err instanceof Error ? err.message : '업로드 실패');
    } finally {
      isImageUploadActiveRef.current = false;
    }
  }

  function removeImage(index: number) {
    setImages(prev => prev.filter((_, currentIndex) => currentIndex !== index));
    setImageUploadError(null);
  }

  function handleReset() {
    setContent('');
    setImages([]);
    setLinkUrl('');
    setIsExpanded(false);
    setImageUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
      alert.warning('이미지 업로드가 끝난 뒤 게시해주세요.');
      return;
    }

    try {
      const normalizedLinkUrl = normalizeFeedLinkUrl(linkUrl);
      await createFeed.mutateAsync({
        content,
        images,
        visibility: 'PUBLIC',
        linkUrl: normalizedLinkUrl || undefined,
      });
      handleReset();
      alert.success('피드가 게시되었습니다');
    } catch (err) {
      alert.error(err instanceof Error ? err.message : '피드 생성 실패');
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
    if (event.dataTransfer?.files?.length) {
      await handleImageUpload(event.dataTransfer.files);
    }
  }

  return {
    content,
    setContent,
    images,
    removeImage,
    linkUrl,
    setLinkUrl,
    isExpanded,
    setIsExpanded,
    hasDraft,
    shouldShowExpanded,
    initials,
    linkPreview,
    contentError,
    imageError,
    linkError,
    canSubmit,
    createFeed,
    isUploading,
    fileInputRef,
    handleImageUpload,
    handleReset,
    handleSubmit,
    handlePaste,
    handleDrop,
  };
}
