'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useFeed, useUpdateFeed, useLinkPreview } from '@/hooks/useFeeds';
import { apiClient } from '@/lib/api-client';
import { LinkPreviewCard } from '@/components/feed/LinkPreviewCard';

export default function EditFeedPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const updateFeed = useUpdateFeed();
  const { data: feed, isLoading: isFeedLoading } = useFeed(id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [linkUrl, setLinkUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const { data: linkPreview } = useLinkPreview(linkUrl);

  useEffect(() => {
    if (feed && !isInitialized) {
      setContent(feed.content || '');
      setImages(feed.images || []);
      setVisibility(feed.visibility || 'PUBLIC');
      setLinkUrl(feed.linkPreview?.url || '');
      setIsInitialized(true);
    }
  }, [feed, isInitialized]);

  const handleImageUpload = async (files: FileList) => {
    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        const result = await apiClient.post<{ url: string }>('/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedUrls.push(result.url);
      }
      setImages([...images, ...uploadedUrls]);
    } catch (err: any) {
      alert(err.response?.data?.message || '업로드에 실패했습니다');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) {
      alert('내용 또는 이미지를 입력해주세요');
      return;
    }

    try {
      await updateFeed.mutateAsync({
        id,
        data: {
          content,
          images,
          visibility,
          linkUrl: linkUrl || undefined,
        },
      });
      router.push('/admin/feed');
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || '피드 수정에 실패했습니다');
    }
  };

  if (isFeedLoading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-surface-300 border-t-surface-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!feed) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <p className="text-surface-500">피드를 찾을 수 없습니다.</p>
      </div>
    );
  }

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
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            피드 관리로 돌아가기
          </Link>
          <h1 className="text-3xl font-sans font-black tracking-tighter text-surface-900">
            피드 수정
          </h1>
        </motion.div>

        <motion.div
          className="max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="bg-white border border-surface-200 rounded-2xl overflow-hidden">
            {/* Images Preview */}
            {images.length > 0 && (
              <div className="p-4 border-b border-surface-100">
                <div className="grid grid-cols-3 gap-2">
                  {images.map((url, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-lg overflow-hidden bg-surface-100"
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
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
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="p-4">
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="오늘 하루는 어땠나요?"
                rows={4}
                className="w-full resize-none text-sm text-surface-900 placeholder-surface-400 focus:outline-none"
              />
            </div>

            {/* Link URL */}
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

            {/* Actions */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-surface-100">
              <div className="flex items-center gap-3">
                {/* Image Upload */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-900 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z"
                    />
                  </svg>
                  {isUploading ? '업로드 중...' : '사진'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => e.target.files && handleImageUpload(e.target.files)}
                  className="hidden"
                />

                {/* Visibility Toggle */}
                <button
                  onClick={() => setVisibility(visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC')}
                  className="flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-900 transition-colors"
                >
                  {visibility === 'PUBLIC' ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                      />
                    </svg>
                  )}
                  {visibility === 'PUBLIC' ? '공개' : '비공개'}
                </button>
              </div>

              <button
                onClick={handleSubmit}
                disabled={updateFeed.isPending || (!content.trim() && images.length === 0)}
                className="px-6 py-2 bg-surface-900 text-white text-sm font-bold rounded-xl hover:bg-surface-800 disabled:opacity-50 transition-colors"
              >
                {updateFeed.isPending ? '저장 중...' : '수정하기'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
