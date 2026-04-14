'use client';

import { Suspense } from 'react';
import { AccountRecoveryForm } from '@/features/auth/ui/recovery/AccountRecoveryForm';
import { LoginPageSkeleton } from '@/shared/ui/RouteSkeletons';

export function AccountRecoveryContainer() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <AccountRecoveryForm />
    </Suspense>
  );
}
