'use client';

import { useState } from 'react';
import { apiClient } from '@/shared/api/api-client';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

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

  const uploadFiles = async (files: FileList): Promise<string[]> => {
    const results: string[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadFile(file);
      results.push(url);
    }
    return results;
  };

  return { uploadFile, uploadFiles, isUploading };
}
