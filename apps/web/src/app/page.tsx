'use client';

import { HeroSection } from '@/widgets/home/ui/HeroSection';
import { FeaturedPostsSection } from '@/widgets/home/ui/FeaturedPostsSection';
import { StatsSection } from '@/widgets/home/ui/StatsSection';

export default function HomePage() {
  return (
    <main className="min-h-screen text-surface-900">
      <HeroSection />

      <FeaturedPostsSection />

      <StatsSection />
    </main>
  );
}
