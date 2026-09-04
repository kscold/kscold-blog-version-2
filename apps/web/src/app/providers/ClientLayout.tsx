'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Header } from '@/widgets/header';
import { Sidebar } from '@/widgets/sidebar';
import { AlertToast } from '@/shared/ui/AlertToast';
import { CustomCursor } from '@/shared/ui/CustomCursor';
import { ScrollProgress } from '@/shared/ui/ScrollProgress';
import { ViewerProvider } from '@/shared/model/ViewerProvider';
import type { InitialViewer } from '@/shared/lib/initialViewer';
import { PageVisitTracker } from '@/shared/analytics/PageVisitTracker';

const FloatingChatWidget = dynamic(
  () => import('@/widgets/chat').then(module => module.FloatingChatWidget),
  { ssr: false }
);

interface ClientLayoutProps {
  children: React.ReactNode;
  footer: React.ReactNode;
  initialViewer: InitialViewer;
}

export function ClientLayout({ children, footer, initialViewer }: ClientLayoutProps) {
  const pathname = usePathname();
  const isVaultPage = pathname.startsWith('/vault');

  return (
    <ViewerProvider initialViewer={initialViewer}>
      <div className={`flex flex-col relative z-0 ${isVaultPage ? 'h-[100dvh] overflow-hidden' : 'min-h-screen'}`}>
        <PageVisitTracker />
        <ScrollProgress />
        <Header />
        <div className={`flex flex-1 w-full ${isVaultPage ? 'mt-16 h-[calc(100dvh-4rem)] overflow-hidden' : 'pt-16'}`}>
          <Sidebar />
          <main
            className={`flex-1 flex flex-col w-full relative ${
              !isVaultPage ? 'lg:pl-64 min-h-[calc(100vh-4rem)]' : 'h-full'
            }`}
          >
            {isVaultPage ? (
              <div className="flex-1 h-full w-full relative">{children}</div>
            ) : (
              <>
                <div className="flex-1 flex flex-col">{children}</div>
                {footer}
              </>
            )}
          </main>
        </div>
        <Suspense fallback={null}>
          <FloatingChatWidget />
        </Suspense>
        <AlertToast />
        <CustomCursor useHomeContrast={pathname === '/'} />
      </div>
    </ViewerProvider>
  );
}
