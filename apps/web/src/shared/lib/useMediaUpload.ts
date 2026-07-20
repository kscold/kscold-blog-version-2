'use client';

import { useState } from 'react';
import { apiClient } from '@/shared/api/api-client';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // nginx client_max_body_size 50M 과 동일

interface UploadResponse {
  url: string;
}

export function useMediaUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File): Promise<string> => {
    if (!file.type.startsWith('image/')) {
      throw new Error('이미지 파일만 업로드 가능합니다');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('파일 크기는 10MB 이하여야 합니다');
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await apiClient.upload<UploadResponse>('/media/upload', formData);
      return result.url;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadVideo = async (file: File): Promise<string> => {
    if (!file.type.startsWith('video/')) {
      throw new Error('동영상 파일만 업로드 가능합니다');
    }
    if (file.size > MAX_VIDEO_SIZE) {
      throw new Error('동영상 크기는 50MB 이하여야 합니다');
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      // 동영상은 용량이 커서 업로드 시간이 길 수 있어 타임아웃을 넉넉히 둠
      const result = await apiClient.upload<UploadResponse>('/media/upload', formData, {
        timeout: 120000,
      });
      return result.url;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadFiles = async (files: FileList): Promise<string[]> => {
    const results: string[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadFile(file);
      results.push(url);
    }
    return results;
  };

  return { uploadFile, uploadVideo, uploadFiles, isUploading };
}
