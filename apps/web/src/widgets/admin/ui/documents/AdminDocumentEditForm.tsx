'use client';

import { useState } from 'react';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import type { AdminDocument, AdminDocumentDetails } from '../../model/adminDocumentTypes';
import { DocumentCategorySelect } from './DocumentCategorySelect';

interface AdminDocumentEditFormProps {
  document: AdminDocument;
  isSaving: boolean;
  onSave: (details: AdminDocumentDetails) => Promise<boolean>;
  onClose: () => void;
}

export function AdminDocumentEditForm({
  document,
  isSaving,
  onSave,
  onClose,
}: AdminDocumentEditFormProps) {
  const [details, setDetails] = useState<AdminDocumentDetails>({
    title: document.title,
    description: document.description ?? '',
    category: document.category,
  });
  async function submit() {
    if (!details.title.trim()) return;
    if (
      await onSave({
        ...details,
        title: details.title.trim(),
        description: details.description.trim(),
      })
    )
      onClose();
  }
  return (
    <section
      aria-labelledby="document-edit-heading"
      className="mb-5 space-y-4 rounded-xl border border-surface-300 bg-surface-50 p-4 sm:p-5"
      data-testid="admin-document-edit-form"
    >
      <div>
        <h3 id="document-edit-heading" className="text-base font-bold text-surface-900">
          문서 정보 수정
        </h3>
        <p className="mt-1 break-all text-xs leading-5 text-surface-500">
          {document.fileName} · 원본 파일과 다운로드 이름은 유지됩니다.
        </p>
      </div>
      <form
        onSubmit={event => {
          event.preventDefault();
          void submit();
        }}
        className="space-y-4"
      >
        <Input
          id="document-edit-title"
          label="문서 이름"
          required
          maxLength={160}
          disabled={isSaving}
          value={details.title}
          onChange={event => setDetails(current => ({ ...current, title: event.target.value }))}
          autoComplete="off"
        />
        <DocumentCategorySelect
          id="document-edit-category"
          value={details.category}
          disabled={isSaving}
          onChange={category => {
            if (category) setDetails(current => ({ ...current, category }));
          }}
        />
        <div className="space-y-2">
          <label
            htmlFor="document-edit-description"
            className="text-sm font-medium text-surface-900"
          >
            설명
          </label>
          <textarea
            id="document-edit-description"
            rows={4}
            maxLength={2000}
            disabled={isSaving}
            value={details.description}
            onChange={event =>
              setDetails(current => ({ ...current, description: event.target.value }))
            }
            className="block w-full resize-y rounded-lg border border-surface-200 bg-white px-4 py-3 text-sm text-surface-900 focus:outline-none focus:ring-1 focus:ring-surface-900 disabled:opacity-50"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="submit"
            size="sm"
            isLoading={isSaving}
            disabled={!details.title.trim()}
            data-testid="admin-document-edit-save"
          >
            저장
          </Button>
          <Button type="button" variant="ghost" size="sm" disabled={isSaving} onClick={onClose}>
            취소
          </Button>
        </div>
      </form>
    </section>
  );
}
