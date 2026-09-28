import Link from 'next/link';
import Button from '@/shared/ui/Button';
import type { AdminDocumentSpaceDetails } from '../../model/adminDocumentTypes';
import { AdminDocumentSpaceNavigation } from './AdminDocumentSpaceNavigation';

interface AdminDocumentsHeaderProps {
  disabled: boolean;
  onRefresh: () => void;
  space: AdminDocumentSpaceDetails;
}

export function AdminDocumentsHeader({ disabled, onRefresh, space }: AdminDocumentsHeaderProps) {
  return (
    <header className="mb-8 space-y-6">
      <Link
        href="/admin"
        className="inline-flex text-sm font-medium text-surface-500 hover:text-surface-900"
      >
        ← 관리자 대시보드
      </Link>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-surface-900 sm:text-4xl">
              {space.title}
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-surface-200 bg-white px-3 py-1 text-xs font-bold text-surface-600">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="h-3.5 w-3.5"
              >
                <rect x="5" y="10" width="14" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              비공개
            </span>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-surface-500">
            {space.description}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          disabled={disabled}
          onClick={onRefresh}
          data-cy="admin-documents-refresh"
        >
          새로고침
        </Button>
      </div>
      <AdminDocumentSpaceNavigation active={space.id} />
      <div className="rounded-2xl border border-surface-200 bg-surface-50 px-5 py-4 text-sm leading-6 text-surface-600">
        <p className="font-semibold text-surface-900">공개 블로그 파일과 분리된 나만의 보관 공간</p>
        <p className="mt-1">
          현재 관리자 계정의 문서만 표시됩니다. 공개 주소·검색 색인·AI Agent 자료로 제공되지 않으며,
          PDF는 이 공간에서 바로 읽고, 다른 형식은 원본을 다운로드할 수 있습니다.
        </p>
        <p className="mt-2">
          기존 파일의 분류는 그대로 유지됩니다. 문서 정보 수정에서 분류를 바꾸면 해당 관리 공간으로
          이동합니다.
        </p>
      </div>
    </header>
  );
}
