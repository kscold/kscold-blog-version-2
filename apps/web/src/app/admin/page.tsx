'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePosts } from '@/hooks/usePosts';
import { useCategories } from '@/hooks/useCategories';
import { useAuthStore } from '@/store/authStore';

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const { data: postsData } = usePosts({ page: 0, size: 5 });
  const { data: categories } = useCategories();

  const posts = postsData?.content || [];
  const totalPosts = postsData?.totalElements || 0;

  const stats = [
    {
      name: '전체 포스트',
      value: totalPosts,
      icon: '📝',
      link: '/admin/posts',
      color: 'from-purple-600 to-blue-600',
    },
    {
      name: '카테고리',
      value: categories?.length || 0,
      icon: '📁',
      link: '/admin/categories',
      color: 'from-blue-600 to-cyan-600',
    },
    {
      name: '발행된 포스트',
      value: posts.filter(p => p.status === 'PUBLISHED').length,
      icon: '✅',
      link: '/admin/posts',
      color: 'from-green-600 to-emerald-600',
    },
    {
      name: '초안',
      value: posts.filter(p => p.status === 'DRAFT').length,
      icon: '📄',
      link: '/admin/posts',
      color: 'from-yellow-600 to-orange-600',
    },
  ];

  const quickActions = [
    {
      name: '새 포스트 작성',
      description: '새로운 블로그 포스트를 작성합니다',
      icon: '✏️',
      link: '/admin/posts/new',
      color: 'from-purple-600 to-blue-600',
    },
    {
      name: '포스트 관리',
      description: '기존 포스트를 수정하거나 삭제합니다',
      icon: '📋',
      link: '/admin/posts',
      color: 'from-blue-600 to-cyan-600',
    },
    {
      name: '카테고리 관리',
      description: '카테고리를 추가, 수정, 삭제합니다',
      icon: '🗂️',
      link: '/admin/categories',
      color: 'from-cyan-600 to-teal-600',
    },
    {
      name: '블로그 보기',
      description: '공개된 블로그를 확인합니다',
      icon: '🌐',
      link: '/blog',
      color: 'from-green-600 to-emerald-600',
    },
  ];

  return (
    <div className="min-h-screen bg-secondary-beige dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white">
              관리자 대시보드
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              안녕하세요, {user?.displayName || user?.username}님
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link
                  href={stat.link}
                  className="block p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}
                    >
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.name}</div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-6">
              빠른 작업
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                >
                  <Link
                    href={action.link}
                    className="block p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg transition-all group"
                  >
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}
                    >
                      {action.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {action.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Posts */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">
                최근 포스트
              </h2>
              <Link
                href="/admin/posts"
                className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
              >
                전체 보기 →
              </Link>
            </div>

            {posts.length > 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {posts.slice(0, 5).map(post => (
                    <Link
                      key={post.id}
                      href={`/admin/posts/${post.id}/edit`}
                      className="block p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                              {post.title}
                            </h3>
                            {post.featured && (
                              <span className="px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
                                Featured
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span>
                              {post.category.icon && `${post.category.icon} `}
                              {post.category.name}
                            </span>
                            <span>•</span>
                            <span>조회수 {post.views}</span>
                            <span>•</span>
                            <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
                          </div>
                        </div>
                        <div>
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              post.status === 'PUBLISHED'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}
                          >
                            {post.status === 'PUBLISHED' ? '발행됨' : '초안'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="text-4xl mb-3">📝</div>
                <p className="text-gray-600 dark:text-gray-400">아직 포스트가 없습니다</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
