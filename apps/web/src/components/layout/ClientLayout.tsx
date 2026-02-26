'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import FloatingChat from '@/components/chat/FloatingChat';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { ScrollProgress } from '@/components/ui/ScrollProgress';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const isVaultPage = pathname.startsWith('/vault');

  return (
    <div className="min-h-screen flex flex-col relative z-0">
      <ScrollProgress />
      <Header />
      <div className="flex flex-1 pt-16 w-full">
        {!isVaultPage && <Sidebar />}
        <main
          className={`flex-1 flex flex-col min-h-[calc(100vh-4rem)] w-full ${
            !isVaultPage ? 'lg:pl-64' : ''
          }`}
        >
          <div className="flex-1">{children}</div>
          {!isVaultPage && <Footer />}
        </main>
      </div>
      <FloatingChat />
      <CustomCursor />
    </div>
  );
}
