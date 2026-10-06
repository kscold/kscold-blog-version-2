'use client';

import { useState } from 'react';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import type { AdminDocumentCategory, AdminDocumentFilter } from '../../model/adminDocumentTypes';
import { DocumentCategorySelect } from './DocumentCategorySelect';

interface AdminDocumentsFilterProps {
  filter: AdminDocumentFilter;
  disabled: boolean;
  fixedCategory?: AdminDocumentCategory;
  onApply: (filter: Pick<AdminDocumentFilter, 'category' | 'query'>) => void;
}

export function AdminDocumentsFilter({
  filter,
  disabled,
  fixedCategory,
  onApply,
}: AdminDocumentsFilterProps) {
  const [query, setQuery] = useState(filter.query);
  return (
    <form
      onSubmit={event => {
        event.preventDefault();
        onApply({ category: filter.category, query });
      }}
      className="mb-5 grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_10rem]"
    >
      <div className="min-w-0">
        <Input
          id="document-search"
          label="문서 검색"
          value={query}
          maxLength={100}
          disabled={disabled}
          onChange={event => setQuery(event.target.value)}
          placeholder="이름, 파일명 또는 설명"
          autoComplete="off"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            disabled={disabled}
            data-testid="admin-documents-search-submit"
          >
            검색
          </Button>
          {filter.query && (
            <Button
              type="button"
              variant="minimal"
              size="sm"
              disabled={disabled}
              onClick={() => {
                setQuery('');
                onApply({ category: filter.category, query: '' });
              }}
            >
              검색 초기화
            </Button>
          )}
        </div>
      </div>
      <DocumentCategorySelect
        id="document-filter-category"
        value={filter.category}
        allowAll={!fixedCategory}
        disabled={disabled || !!fixedCategory}
        onChange={category => onApply({ category, query: filter.query })}
      />
    </form>
  );
}
