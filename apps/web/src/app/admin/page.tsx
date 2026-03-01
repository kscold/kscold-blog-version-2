'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAdminPosts } from '@/hooks/usePosts';
import { useCategories } from '@/hooks/useCategories';
import { useFeeds } from '@/hooks/useFeeds';
import { useAllVaultNotes } from '@/hooks/useVault';
import { useAuthStore } from '@/store/authStore';

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const { data: postsData } = useAdminPosts(0, 5);
  const { data: allPostsData } = useAdminPosts(0, 1);
  const { data: categories } = useCategories();
  const { data: feedsData } = useFeeds({ page: 0, size: 1 });
  const { data: vaultData } = useAllVaultNotes(0, 1);

  const posts = postsData?.content || [];
  const totalPosts = allPostsData?.totalElements || 0;
  const totalFeeds = feedsData?.totalElements || 0;
  const totalVaultNotes = vaultData?.totalElements || 0;

  const stats = [
    {
      name: '전체 포스트',
      value: totalPosts,
      link: '/admin/posts',
      color: 'from-purple-600 to-blue-600',
    },
    {
      name: '카테고리',
      value: categories?.length || 0,
      link: '/admin/categories',
      color: 'from-blue-600 to-cyan-600',
    },
    {
      name: '피드',
      value: totalFeeds,
      link: '/admin/feed',
      color: 'from-pink-600 to-rose-600',
    },
    {
      name: 'Vault 노트',
      value: totalVaultNotes,
      link: '/admin/vault',
      color: 'from-violet-600 to-purple-600',
    },
  ];

  const quickActions = [
    {
      name: '새 포스트 작성',
      description: '블로그 포스트를 작성합니다',
      link: '/admin/posts/new',
      color: 'from-purple-600 to-blue-600',
    },
    {
      name: '새 피드 작성',
      description: '일상 피드를 작성합니다',
      link: '/admin/feed/new',
      color: 'from-pink-600 to-rose-600',
    },
    {
      name: '새 노트 작성',
      description: 'Vault 노트를 작성합니다',
      link: '/admin/vault/new',
      color: 'from-violet-600 to-purple-600',
    },
    {
      name: '카테고리 관리',
      description: '카테고리를 관리합니다',
      link: '/admin/categories',
      color: 'from-cyan-600 to-teal-600',
    },
  ];

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-sans font-black tracking-tighter text-surface-900">
              Dashboard
            </h1>
            <p className="text-surface-500 mt-2">{user?.displayName || user?.username}</p>
          </div>

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

            {posts.length > 0 ? (
              <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
                <div className="divide-y divide-surface-100">
                  {posts.map(post => (
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
        </motion.div>
      </div>
    </div>
  );
}
