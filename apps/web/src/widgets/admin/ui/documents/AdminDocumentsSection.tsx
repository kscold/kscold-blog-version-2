'use client';

import Link from 'next/link';
import Button from '@/shared/ui/Button';
import { useAdminDocumentIdentity } from '../../model/useAdminDocumentIdentity';
import { AdminDocumentsWorkspace } from './AdminDocumentsWorkspace';

export function AdminDocumentsSection() {
  const { user, hasHydrated, isVerifying, error, verifyAgain } = useAdminDocumentIdentity();

  if (!hasHydrated || (!user && isVerifying)) {
    return (
      <p className="p-8 text-sm text-surface-500" role="status">
        관리자 권한을 확인하고 있습니다.
      </p>
    );
  }
  if (user?.role !== 'ADMIN') {
    return (
      <div className="p-8 text-sm text-surface-600" data-cy="admin-documents-auth-required">
        <p role={error ? 'alert' : undefined}>
          {error || '개인 문서는 관리자 로그인 후 이용할 수 있습니다.'}
        </p>
        {!user && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-4 mr-3"
            onClick={verifyAgain}
            data-cy="admin-documents-verify-session"
          >
            로그인 상태 다시 확인
          </Button>
        )}
        <Link
          href="/login?redirect=%2Fadmin%2Fdocuments"
          className="mt-3 inline-block font-bold text-surface-900"
        >
          로그인하기
        </Link>
      </div>
    );
  }
  // 계정이 바뀌면 이전 사용자의 문서·업로드 상태를 남기지 않고 화면을 새로 만든다.
  return <AdminDocumentsWorkspace key={user.id} />;
}
