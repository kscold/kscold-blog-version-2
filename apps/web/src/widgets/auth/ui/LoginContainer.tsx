'use client';

import { Suspense } from 'react';
import { LoginForm } from '@/features/auth/ui/LoginForm';

export function LoginContainer() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface-50 flex items-center justify-center">
          <p>Loading...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
