'use client';

import { useState } from 'react';
import Button from '@/shared/ui/Button';
import type {
  AdminDocumentCategory,
  AdminDocumentSpaceDetails,
  DocumentUploadItem,
} from '../../model/adminDocumentTypes';
import { DocumentCategorySelect } from './DocumentCategorySelect';
import { DocumentFileDropzone } from './DocumentFileDropzone';
import { DocumentUploadResults } from './DocumentUploadResults';

interface AdminDocumentsUploadPanelProps {
  items: DocumentUploadItem[];
  isUploading: boolean;
  disabled: boolean;
  onFiles: (files: File[]) => void;
  onUpload: (options: { category: AdminDocumentCategory; description: string }) => Promise<void>;
  onClear: () => void;
  space: AdminDocumentSpaceDetails;
}

export function AdminDocumentsUploadPanel({
  items,
  isUploading,
  disabled,
  onFiles,
  onUpload,
  onClear,
  space,
}: AdminDocumentsUploadPanelProps) {
  const [category, setCategory] = useState<AdminDocumentCategory>(space.fixedCategory ?? 'RESUME');
  const [description, setDescription] = useState('');
  const pendingCount = items.filter(item => item.status === 'queued').length;
  return (
    <section
      aria-labelledby="document-upload-heading"
      className="min-w-0 rounded-2xl border border-surface-200 bg-white p-5 sm:p-6"
    >
      <div className="mb-5 space-y-1">
        <h2 id="document-upload-heading" className="text-lg font-bold text-surface-900">
          {space.uploadHeading}
        </h2>
        <p className="text-xs leading-5 text-surface-500">
          {space.uploadGuide}
        </p>
      </div>
      <div className="space-y-5">
        <DocumentFileDropzone disabled={disabled || isUploading} onFiles={onFiles} />
        <DocumentCategorySelect
          id="document-upload-category"
          value={space.fixedCategory ?? category}
          disabled={disabled || isUploading || !!space.fixedCategory}
          onChange={value => {
            if (value) setCategory(value);
          }}
          label="업로드할 문서의 분류"
        />
        <div className="space-y-2">
          <label
            htmlFor="document-upload-description"
            className="text-sm font-medium text-surface-900"
          >
            설명 <span className="font-normal text-surface-400">선택</span>
          </label>
          <textarea
            id="document-upload-description"
            value={description}
            onChange={event => setDescription(event.target.value)}
            maxLength={2000}
            disabled={disabled || isUploading}
            placeholder={space.descriptionPlaceholder}
            rows={3}
            className="block w-full resize-y rounded-lg border border-surface-200 bg-white px-4 py-3 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-1 focus:ring-surface-900 disabled:opacity-50"
          />
          <p className="text-xs text-surface-400">분류와 설명은 선택한 파일에 함께 적용됩니다.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            className="flex-1"
            isLoading={isUploading}
            disabled={disabled || !pendingCount}
            onClick={() =>
              void onUpload({
                category: space.fixedCategory ?? category,
                description: description.trim(),
              })
            }
            data-testid="admin-documents-upload-submit"
          >
            {isUploading
              ? '업로드 중'
              : pendingCount
                ? `${pendingCount}개 파일 업로드`
                : '파일 업로드'}
          </Button>
          {items.length > 0 && (
            <Button
              type="button"
              variant="minimal"
              size="sm"
              disabled={disabled || isUploading}
              onClick={onClear}
            >
              선택 비우기
            </Button>
          )}
        </div>
        <DocumentUploadResults items={items} isUploading={isUploading} />
        <div className="border-t border-surface-100 pt-4 text-xs leading-5 text-surface-500">
          <p>동일한 이름으로 올려도 기존 파일을 덮어쓰지 않고 별도 문서로 저장합니다.</p>
          <p className="mt-2">
            지원 형식: PDF, MD, TXT, HTML, Word, Excel, PowerPoint, 한글, CSV, JSON, ZIP, 7Z, PNG,
            JPG, WEBP, GIF, SVG. 폴더는 ZIP으로 묶어서 올려 주세요.
          </p>
        </div>
      </div>
    </section>
  );
}
