'use client';

import { Fragment, type ReactNode } from 'react';
import Button from '@/shared/ui/Button';
import { useAdminDocumentIdentity } from '../../model/useAdminDocumentIdentity';

export function AdminDocumentAccessGate({
  children,
  redirect = '/admin/documents',
}: {
  children: ReactNode;
  redirect?: string;
}) {
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
      <div className="p-8 text-sm text-surface-600" data-testid="admin-documents-auth-required">
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
            data-testid="admin-documents-verify-session"
          >
            로그인 상태 다시 확인
          </Button>
        )}
        <a
          href={`/login?redirect=${encodeURIComponent(redirect)}`}
          className="mt-3 inline-block font-bold text-surface-900"
        >
          로그인하기
        </a>
      </div>
    );
  }
  // 계정 변경 시 문서 목록뿐 아니라 PDF 바이트·워커·화면도 함께 폐기한다.
  return <Fragment key={user.id}>{children}</Fragment>;
}
