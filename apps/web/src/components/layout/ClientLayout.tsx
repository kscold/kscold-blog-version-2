'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import FloatingChat from '@/components/chat/FloatingChat';
import { CustomCursor } from '@/components/ui/CustomCursor';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <div className="min-h-screen flex flex-col relative z-0">
      <Header />
      <div className="flex flex-1 pt-16">
        <Sidebar />
        <main className="flex-1 flex flex-col min-h-[calc(100vh-4rem)] lg:ml-56 lg:border-l lg:border-surface-200 bg-white">
          <div className="flex-1">{children}</div>
          <Footer />
        </main>
      </div>
      <FloatingChat />
      <CustomCursor />
    </div>
  );
}
