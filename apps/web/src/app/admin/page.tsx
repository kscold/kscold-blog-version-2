'use client';

import { motion } from 'framer-motion';
import { useAdminPosts } from '@/entities/post/api/usePosts';
import { useCategories } from '@/entities/category/api/useCategories';
import { useFeeds } from '@/entities/feed/api/useFeeds';
import { useAllVaultNotes } from '@/entities/vault/api/useVault';
import { useAuthStore } from '@/entities/user/model/authStore';
import { useTags } from '@/entities/tag/api/useTags';
import { DashboardStats } from '@/widgets/admin/ui/DashboardStats';

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const { data: postsData } = useAdminPosts(0, 5);
  const { data: allPostsData } = useAdminPosts(0, 1);
  const { data: categories } = useCategories();
  const { data: feedsData } = useFeeds({ page: 0, size: 1 });
  const { data: vaultData } = useAllVaultNotes(0, 1);
  const { data: tagsData } = useTags();

  const posts = postsData?.content || [];
  const totalPosts = allPostsData?.totalElements || 0;
  const totalFeeds = feedsData?.totalElements || 0;
  const totalVaultNotes = vaultData?.totalElements || 0;
  const totalTags = tagsData?.length || 0;

  const stats = [
    { name: '전체 포스트', value: totalPosts, link: '/admin/posts', color: 'from-purple-600 to-blue-600' },
    { name: '카테고리', value: categories?.length || 0, link: '/admin/categories', color: 'from-blue-600 to-cyan-600' },
    { name: '피드', value: totalFeeds, link: '/admin/feed', color: 'from-pink-600 to-rose-600' },
    { name: 'Vault 노트', value: totalVaultNotes, link: '/admin/vault', color: 'from-violet-600 to-purple-600' },
    { name: '태그', value: totalTags, link: '/admin/tags', color: 'from-emerald-600 to-green-600' },
  ];

  const quickActions = [
    { name: '새 포스트 작성', description: '블로그 포스트를 작성합니다', link: '/admin/posts/new', color: 'from-purple-600 to-blue-600' },
    { name: '새 피드 작성', description: '일상 피드를 작성합니다', link: '/admin/feed/new', color: 'from-pink-600 to-rose-600' },
    { name: '새 노트 작성', description: 'Vault 노트를 작성합니다', link: '/admin/vault/new', color: 'from-violet-600 to-purple-600' },
    { name: '카테고리 관리', description: '카테고리를 관리합니다', link: '/admin/categories', color: 'from-cyan-600 to-teal-600' },
    { name: '태그 관리', description: '태그를 생성하고 관리합니다', link: '/admin/tags', color: 'from-emerald-600 to-green-600' },
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

          <DashboardStats
            stats={stats}
            quickActions={quickActions}
            recentPosts={posts}
          />
        </motion.div>
      </div>
    </div>
  );
}
