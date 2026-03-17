'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateFeed, useLinkPreview } from '@/entities/feed/api/useFeeds';
import { useAuth } from '@/features/auth/api/useAuth';
import { useMediaUpload } from '@/shared/lib/useMediaUpload';
import { LinkPreviewCard } from '@/shared/ui/LinkPreviewCard';
import { useAlert } from '@/shared/model/alertStore';

export function FeedComposer() {
  const { currentUser, isAuthenticated } = useAuth();
  const createFeed = useCreateFeed();
  const alert = useAlert();
  const { uploadFiles, isUploading } = useMediaUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [linkUrl, setLinkUrl] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: linkPreview } = useLinkPreview(linkUrl);

  if (!isAuthenticated || !currentUser) return null;

  const handleImageUpload = async (files: FileList) => {
    try {
      const uploaded = await uploadFiles(files);
      setImages(prev => [...prev, ...uploaded]);
    } catch (err) {
      alert.error(err instanceof Error ? err.message : '업로드 실패');
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
      setContent('');
      setImages([]);
      setLinkUrl('');
      setIsExpanded(false);
      alert.success('피드가 게시되었습니다');
    } catch (err) {
      alert.error(err instanceof Error ? err.message : '피드 생성 실패');
    }
  };

  return (
    <motion.div
      className="bg-white border border-surface-200 rounded-2xl overflow-hidden mb-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <div className="w-9 h-9 bg-surface-200 rounded-full flex items-center justify-center overflow-hidden">
          <span className="text-sm font-bold text-surface-600">
            {currentUser.displayName.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="text-sm font-bold text-surface-900">{currentUser.displayName}</span>
      </div>

      {/* Textarea */}
      <div
        className="px-4 pb-2"
        onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={async e => {
          e.preventDefault();
          if (e.dataTransfer?.files?.length) await handleImageUpload(e.dataTransfer.files);
        }}
      >
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
              const imgs = Array.from(files).filter(f => f.type.startsWith('image/'));
              if (imgs.length) {
                e.preventDefault();
                const dt = new DataTransfer();
                imgs.forEach(f => dt.items.add(f));
                await handleImageUpload(dt.files);
              }
            }
          }}
          placeholder="개발 이야기를 공유해보세요..."
          rows={isExpanded ? 3 : 1}
          className="w-full resize-none text-sm text-surface-900 placeholder-surface-400 focus:outline-none transition-all"
        />
      </div>

      {/* Expanded area */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Images */}
            {images.length > 0 && (
              <div className="px-4 pb-3">
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((url, i) => (
                    <div key={i} className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-surface-100">
                      <Image src={url} alt="" fill sizes="80px" className="object-cover" />
                      <button
                        onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
                      >
                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Link URL */}
            <div className="px-4 pb-3">
              <input
                type="url"
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                placeholder="링크 URL (선택)"
                className="w-full px-3 py-1.5 text-xs border border-surface-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-surface-400 bg-surface-50"
              />
              {linkPreview?.title && (
                <div className="mt-2">
                  <LinkPreviewCard preview={linkPreview} />
                </div>
              )}
            </div>

            {/* Action bar */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-surface-100">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-1 text-xs text-surface-500 hover:text-surface-900 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z" />
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

                <button
                  onClick={() => {
                    setContent('');
                    setImages([]);
                    setLinkUrl('');
                    setIsExpanded(false);
                  }}
                  className="text-xs text-surface-400 hover:text-surface-600 transition-colors"
                >
                  취소
                </button>
              </div>

              <button
                onClick={handleSubmit}
                disabled={createFeed.isPending || (!content.trim() && images.length === 0)}
                className="px-4 py-1.5 bg-surface-900 text-white text-xs font-bold rounded-lg hover:bg-surface-800 disabled:opacity-50 transition-colors"
              >
                {createFeed.isPending ? '게시 중...' : '게시하기'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
