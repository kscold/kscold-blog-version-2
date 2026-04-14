'use client';

import { Suspense } from 'react';
import { PasswordResetForm } from '@/features/auth/ui/recovery/PasswordResetForm';
import { LoginPageSkeleton } from '@/shared/ui/RouteSkeletons';

export function PasswordResetContainer() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <PasswordResetForm />
    </Suspense>
  );
}
