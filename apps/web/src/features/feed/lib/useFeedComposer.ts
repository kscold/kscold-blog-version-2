'use client';

import { useMemo, useRef, useState } from 'react';
import { useCreateFeed, useLinkPreview } from '@/entities/feed/api/useFeeds';
import { useMediaUpload } from '@/shared/lib/useMediaUpload';
import { useAlert } from '@/shared/model/alertStore';
import type { User } from '@/types/user';

export function useFeedComposer(currentUser: User | null) {
  const createFeed = useCreateFeed();
  const alert = useAlert();
  const { uploadFiles, isUploading } = useMediaUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [linkUrl, setLinkUrl] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: linkPreview } = useLinkPreview(linkUrl);

  const hasDraft =
    content.trim().length > 0 || images.length > 0 || linkUrl.trim().length > 0;
  const shouldShowExpanded = isExpanded || hasDraft;
  const initials = useMemo(
    () => (currentUser ? currentUser.displayName.charAt(0).toUpperCase() : ''),
    [currentUser]
  );

  async function handleImageUpload(files: FileList) {
    try {
      const uploaded = await uploadFiles(files);
      setImages(prev => [...prev, ...uploaded]);
      setIsExpanded(true);
    } catch (err) {
      alert.error(err instanceof Error ? err.message : '업로드 실패');
    }
  }

  function handleReset() {
    setContent('');
    setImages([]);
    setLinkUrl('');
    setIsExpanded(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleSubmit() {
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
    setImages,
    linkUrl,
    setLinkUrl,
    isExpanded,
    setIsExpanded,
    hasDraft,
    shouldShowExpanded,
    initials,
    linkPreview,
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
