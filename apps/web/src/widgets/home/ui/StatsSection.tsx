'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useVaultGraph } from '@/entities/vault/api/useVault';
import { usePosts } from '@/entities/post/api/usePosts';
import { useGitHubOverview } from '@/entities/github';
import { usePerformanceMode } from '@/shared/model/usePerformanceMode';
import { GitHubHeatmap } from './GitHubHeatmap';
import { StatsGrid } from './StatsGrid';

export function StatsSection() {
  const { allowRichEffects, isTouchDevice } = usePerformanceMode();
  const { data: github } = useGitHubOverview('kscold');
  const { data: graphData } = useVaultGraph();
  const { data: postsData } = usePosts({ page: 0, size: 1 });

  const noteCount = graphData?.nodes?.length ?? null;
  const postCount = postsData?.totalElements ?? null;
  const commitCount = github?.totalContributions ?? null;

  const stats = [
    { label: 'Vault Notes', value: noteCount, suffix: '개', description: '기록된 지식' },
    { label: 'Blog Posts', value: postCount, suffix: '편', description: '발행된 글' },
    { label: 'Contributions', value: commitCount, suffix: '', description: '최근 365일 기여' },
    { label: 'Followers', value: github?.followers ?? null, suffix: '', description: 'GitHub 팔로워' },
    { label: 'Repositories', value: github?.publicRepos ?? null, suffix: '', description: '공개 저장소' },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-surface-200">
      <div className="max-w-5xl mx-auto space-y-12">
        <motion.div
          className="text-center"
          initial={allowRichEffects ? { opacity: 0, y: 16 } : false}
          whileInView={allowRichEffects ? { opacity: 1, y: 0 } : undefined}
          viewport={allowRichEffects ? { once: true } : undefined}
          transition={allowRichEffects ? { duration: 0.6 } : undefined}
        >
          <p className="text-xs font-bold tracking-[0.25em] text-surface-400 uppercase mb-3">By the Numbers</p>
          <p className="text-surface-500 text-base leading-relaxed">지식을 기록하고, 기록을 연결하고, 연결을 공유합니다.</p>
        </motion.div>

        <StatsGrid stats={stats} />

        <GitHubHeatmap username="kscold" />

        <motion.div
          className="text-center"
          initial={allowRichEffects ? { opacity: 0 } : false}
          whileInView={allowRichEffects ? { opacity: 1 } : undefined}
          viewport={allowRichEffects ? { once: true } : undefined}
          transition={allowRichEffects ? { duration: 0.6, delay: 0.4 } : undefined}
        >
          <Link href="/vault" className={`inline-flex items-center gap-2 px-8 py-3 bg-surface-900 hover:bg-surface-800 text-white rounded-xl transition-colors font-bold text-sm ${isTouchDevice ? 'shadow-sm' : 'shadow-lg'}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Knowledge Graph 보기
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
