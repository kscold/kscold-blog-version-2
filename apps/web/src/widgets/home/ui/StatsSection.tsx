'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useVaultGraph } from '@/entities/vault/api/useVault';
import { usePosts } from '@/entities/post/api/usePosts';
import { useGitHubContributions } from '../lib/useGitHubContributions';
import { GitHubHeatmap } from './GitHubHeatmap';

export function StatsSection() {
  const github = useGitHubContributions('kscold');
  const { data: graphData } = useVaultGraph();
  const { data: postsData } = usePosts({ page: 0, size: 1 });

  const noteCount = graphData?.nodes?.length ?? null;
  const postCount = postsData?.totalElements ?? null;
  const commitCount = github?.total ?? null;

  const stats = [
    { label: 'Vault Notes', value: noteCount, suffix: '개', description: '지식 노드' },
    { label: 'Blog Posts', value: postCount, suffix: '편', description: '발행된 글' },
    { label: 'Contributions', value: commitCount, suffix: '', description: `${new Date().getFullYear()}년 기여` },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-surface-200">
      <div className="max-w-5xl mx-auto space-y-12">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-bold tracking-[0.25em] text-surface-400 uppercase mb-3">By the Numbers</p>
          <p className="text-surface-500 text-base leading-relaxed">지식을 기록하고, 기록을 연결하고, 연결을 공유합니다.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="rounded-2xl border border-surface-200 bg-surface-50 p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <p className="text-xs font-bold text-surface-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <div className="flex items-end gap-1 my-2">
                {stat.value !== null && stat.value > 0 ? (
                  <>
                    <span className="text-4xl font-black tabular-nums text-surface-900">{stat.value.toLocaleString()}</span>
                    {stat.suffix && <span className="text-lg font-bold text-surface-400 mb-1">{stat.suffix}</span>}
                  </>
                ) : (
                  <span className="text-4xl font-black tabular-nums text-surface-300">—</span>
                )}
              </div>
              <p className="text-xs text-surface-400">{stat.description}</p>
            </motion.div>
          ))}
        </div>

        <GitHubHeatmap days={github?.days ?? []} />

        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link href="/vault" className="inline-flex items-center gap-2 px-8 py-3 bg-surface-900 hover:bg-surface-800 text-white rounded-xl transition-colors font-bold shadow-lg text-sm">
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
