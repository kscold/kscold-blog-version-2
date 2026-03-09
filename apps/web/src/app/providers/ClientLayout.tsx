'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/widgets/header/ui/Header';
import { Footer } from '@/widgets/footer/ui/Footer';
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar';
import FloatingChat from '@/features/chat/ui/FloatingChat';
import { AlertToast } from '@/shared/ui/AlertToast';
import { CustomCursor } from '@/shared/ui/CustomCursor';
import { ScrollProgress } from '@/shared/ui/ScrollProgress';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const isVaultPage = pathname.startsWith('/vault');

  return (
    <div className={`flex flex-col relative z-0 ${isVaultPage ? 'h-[100dvh] overflow-hidden' : 'min-h-screen'}`}>
      <ScrollProgress />
      <Header />
      <div className={`flex flex-1 pt-16 w-full ${isVaultPage ? 'h-[calc(100dvh-4rem)] overflow-hidden' : ''}`}>
        {!isVaultPage && <Sidebar />}
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
      <FloatingChat />
      <AlertToast />
      <CustomCursor />
    </div>
  );
}
