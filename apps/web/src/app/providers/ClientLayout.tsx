'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/widgets/header/ui/Header';
import { Footer } from '@/widgets/footer/ui/Footer';
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar';
import { FloatingChatWidget } from '@/widgets/chat/ui/FloatingChatWidget';
import { AlertToast } from '@/shared/ui/AlertToast';
import { CustomCursor } from '@/shared/ui/CustomCursor';
import { ScrollProgress } from '@/shared/ui/ScrollProgress';
import { ViewerProvider } from '@/shared/model/ViewerProvider';
import type { InitialViewer } from '@/shared/lib/initialViewer';

interface ClientLayoutProps {
  children: React.ReactNode;
  initialViewer: InitialViewer;
}

export function ClientLayout({ children, initialViewer }: ClientLayoutProps) {
  const pathname = usePathname();
  const isVaultPage = pathname.startsWith('/vault');

  return (
    <ViewerProvider initialViewer={initialViewer}>
      <div className={`flex flex-col relative z-0 ${isVaultPage ? 'h-[100dvh] overflow-hidden' : 'min-h-screen'}`}>
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
                <Footer />
              </>
            )}
          </main>
        </div>
        <FloatingChatWidget />
        <AlertToast />
        <CustomCursor />
      </div>
    </ViewerProvider>
  );
}
