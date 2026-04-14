'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Post } from '@/types/blog';

interface StatItem {
  name: string;
  value: number;
  link: string;
}

interface QuickAction {
  name: string;
  description: string;
  link: string;
  dataCy?: string;
}

interface DashboardStatsProps {
  stats: StatItem[];
  quickActions: QuickAction[];
  recentPosts: Post[];
}

export function DashboardStats({ stats, quickActions, recentPosts }: DashboardStatsProps) {
  return (
    <>
      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <Link
              href={stat.link}
              className="block rounded-2xl border border-surface-200 bg-white p-4 transition-all hover:border-surface-300 hover:shadow-sm group"
            >
              <div className="mb-1 text-2xl font-black text-surface-900 sm:text-3xl">{stat.value}</div>
              <div className="text-xs font-medium leading-5 text-surface-500 sm:text-sm">{stat.name}</div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mb-10 space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-surface-900">빠른 작업</h2>
          <p className="text-sm leading-6 text-surface-500">
            자주 쓰는 관리 화면으로 바로 이동할 수 있도록 묶어두었습니다.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
            >
              <Link
                href={action.link}
                data-cy={action.dataCy}
                className="flex min-h-[106px] items-start gap-3 rounded-2xl bg-surface-900 p-4 text-white transition-colors hover:bg-surface-800 group"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="text-sm font-bold leading-5">{action.name}</h3>
                  <p className="text-xs leading-5 text-surface-400 [overflow-wrap:anywhere]">
                    {action.description}
                  </p>
                </div>
                <svg className="mt-1 h-4 w-4 shrink-0 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-surface-900">최근 포스트</h2>
          <Link
            href="/admin/posts"
            className="text-sm font-medium text-surface-500 hover:text-surface-900 transition-colors"
          >
            전체 보기
          </Link>
        </div>

        {recentPosts.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white">
            <div className="divide-y divide-surface-100">
              {recentPosts.map(post => (
                <Link
                  key={post.id}
                  href={`/admin/posts/${post.id}/edit`}
                  className="block p-4 transition-colors hover:bg-surface-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold leading-5 text-surface-900 [overflow-wrap:anywhere]">
                        {post.title}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-5 text-surface-500">
                        {post.category && <span>{post.category.name}</span>}
                        <span>조회 {post.views}</span>
                        <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 px-2 py-1 text-xs font-bold rounded-full ${
                        post.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-700'
                          : post.status === 'DRAFT'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-surface-100 text-surface-500'
                      }`}
                    >
                      {post.status === 'PUBLISHED' ? '발행' : post.status === 'DRAFT' ? '초안' : '보관'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-surface-200 bg-white py-12 text-center">
            <p className="text-surface-500">아직 포스트가 없습니다</p>
          </div>
        )}
      </div>
    </>
  );
}
