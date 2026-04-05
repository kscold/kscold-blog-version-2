'use client';

import { Suspense } from 'react';
import { LoginForm } from '@/features/auth/ui/LoginForm';
import { LoginPageSkeleton } from '@/shared/ui/RouteSkeletons';

export function LoginContainer() {
  return (
    <Suspense
      fallback={<LoginPageSkeleton />}
    >
      <LoginForm />
    </Suspense>
  );
}
