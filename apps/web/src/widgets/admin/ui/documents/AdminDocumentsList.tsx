import Button from '@/shared/ui/Button';
import { Pagination } from '@/shared/ui/Pagination';
import type { AdminDocument, AdminDocumentPage } from '../../model/adminDocumentTypes';
import { AdminDocumentCard } from './AdminDocumentCard';

interface AdminDocumentsListProps {
  listing: AdminDocumentPage | null;
  page: number;
  isLoading: boolean;
  disabled: boolean;
  error: string;
  notice: string;
  hasFilter: boolean;
  emptyDescription: string;
  isCategoryLocked: boolean;
  onRefresh: () => void;
  onEdit: (document: AdminDocument) => void;
  onDelete: (document: AdminDocument) => void;
  onPageChange: (page: number) => void;
}

export function AdminDocumentsList(props: AdminDocumentsListProps) {
  const { listing, isLoading, disabled, error, notice, hasFilter } = props;
  return (
    <div className="space-y-4" aria-busy={isLoading} data-cy="admin-documents-list">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-surface-500">
        <p>
          {listing
            ? `${hasFilter ? '검색 결과' : '보관 중인 문서'} ${listing.totalElements.toLocaleString()}개`
            : '문서 목록'}
        </p>
        <span>최근 등록순</span>
      </div>
      {notice && (
        <p role="status" className="rounded-xl bg-surface-50 px-4 py-3 text-sm text-surface-700">
          {notice}
        </p>
      )}
      {error && (
        <div
          role="alert"
          className="space-y-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <p className="break-words">{error}</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled || isLoading}
            onClick={props.onRefresh}
          >
            목록 다시 불러오기
          </Button>
        </div>
      )}
      {isLoading ? (
        <p
          role="status"
          className="rounded-xl border border-surface-200 py-16 text-center text-sm text-surface-500"
        >
          문서를 불러오고 있습니다.
        </p>
      ) : listing?.content.length ? (
        <div className="space-y-3">
          {listing.content.map(document => (
            <AdminDocumentCard
              key={document.id}
              document={document}
              disabled={disabled}
              onEdit={() => props.onEdit(document)}
              onDelete={() => props.onDelete(document)}
            />
          ))}
        </div>
      ) : (
        !error && (
          <div className="rounded-xl border border-dashed border-surface-200 bg-surface-50 px-5 py-16 text-center">
            <p className="font-semibold text-surface-900">
              {hasFilter ? '조건에 맞는 문서가 없습니다.' : '아직 보관한 문서가 없습니다.'}
            </p>
            <p className="mt-2 text-sm leading-6 text-surface-500">
              {hasFilter
                ? props.isCategoryLocked
                  ? '검색어를 바꾸거나 검색을 초기화해 보세요.'
                  : '검색어나 분류를 변경해 보세요.'
                : props.emptyDescription}
            </p>
          </div>
        )
      )}
      {listing && listing.totalPages > 1 && (
        <nav aria-label="문서 페이지" className="space-y-3 pt-2">
          <Pagination
            page={props.page}
            totalPages={listing.totalPages}
            onPageChange={props.onPageChange}
            maxVisible={3}
          />
          <p className="text-center text-xs text-surface-400">
            {props.page + 1} / {listing.totalPages} 페이지
          </p>
        </nav>
      )}
    </div>
  );
}
