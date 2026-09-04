'use client';

import Link from 'next/link';
import { MessageDeliveryContainer } from '@/widgets/admin';

export default function AdminMessageDeliveriesPage() {
  return (
    <main className="min-h-screen bg-surface-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-surface-400">
              Notifications
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-surface-900 sm:text-4xl">
              알림 발송 로그
            </h1>
          </div>
          <Link
            href="/admin"
            className="text-sm text-surface-500 transition-colors hover:text-surface-900"
          >
            대시보드로 돌아가기
          </Link>
        </header>
        <MessageDeliveryContainer />
      </div>
    </main>
  );
}
