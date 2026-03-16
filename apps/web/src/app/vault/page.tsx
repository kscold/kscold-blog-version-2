'use client';

import { Suspense } from 'react';
import { VaultGraphLayout } from '@/widgets/vault/ui/VaultGraphLayout';

export default function VaultIndexPage() {
  return (
    <Suspense>
      <VaultGraphLayout />
    </Suspense>
  );
}
