'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Post } from '@/types/blog';

interface StatItem {
  name: string;
  value: number;
  link: string;
  color: string;
}

interface QuickAction {
  name: string;
  description: string;
  link: string;
  color: string;
}

interface DashboardStatsProps {
  stats: StatItem[];
  quickActions: QuickAction[];
  recentPosts: Post[];
}

export function DashboardStats({ stats, quickActions, recentPosts }: DashboardStatsProps) {
  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <Link
              href={stat.link}
              className="block p-5 bg-white border border-surface-200 rounded-2xl hover:border-surface-300 hover:shadow-sm transition-all group"
            >
              <div className="text-3xl font-black text-surface-900 mb-1">{stat.value}</div>
              <div className="text-sm font-medium text-surface-500">{stat.name}</div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-surface-900 mb-4">빠른 작업</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
            >
              <Link
                href={action.link}
                className={`block p-5 bg-gradient-to-br ${action.color} rounded-2xl text-white hover:shadow-lg transition-all group`}
              >
                <h3 className="font-bold mb-1">{action.name}</h3>
                <p className="text-sm text-white/70">{action.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Posts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-surface-900">최근 포스트</h2>
          <Link
            href="/admin/posts"
            className="text-sm font-medium text-surface-500 hover:text-surface-900 transition-colors"
          >
            전체 보기
          </Link>
        </div>

        {recentPosts.length > 0 ? (
          <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
            <div className="divide-y divide-surface-100">
              {recentPosts.map(post => (
                <Link
                  key={post.id}
                  href={`/admin/posts/${post.id}/edit`}
                  className="block p-5 hover:bg-surface-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-surface-900 truncate">{post.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-surface-500">
                        {post.category && <span>{post.category.name}</span>}
                        <span>조회수 {post.views}</span>
                        <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
                      </div>
                    </div>
                    <span
                      className={`ml-4 px-3 py-1 text-xs font-bold rounded-full ${
                        post.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-700'
                          : post.status === 'DRAFT'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-surface-100 text-surface-500'
                      }`}
                    >
                      {post.status === 'PUBLISHED'
                        ? '발행'
                        : post.status === 'DRAFT'
                          ? '초안'
                          : '보관'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-surface-200">
            <p className="text-surface-500">아직 포스트가 없습니다</p>
          </div>
        )}
      </div>
    </>
  );
}
