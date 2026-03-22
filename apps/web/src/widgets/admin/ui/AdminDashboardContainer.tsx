'use client';

import { useAdminPosts } from '@/entities/post/api/usePosts';
import { useCategories } from '@/entities/category/api/useCategories';
import { useFeeds } from '@/entities/feed/api/useFeeds';
import { useAllVaultNotes } from '@/entities/vault/api/useVault';
import { useAuthStore } from '@/entities/user/model/authStore';
import { useTags } from '@/entities/tag/api/useTags';
import { DashboardStats } from './DashboardStats';

export function AdminDashboardContainer() {
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
    { name: '전체 포스트', value: totalPosts, link: '/admin/posts' },
    { name: '카테고리', value: categories?.length || 0, link: '/admin/categories' },
    { name: '피드', value: totalFeeds, link: '/admin/feed' },
    { name: 'Vault 노트', value: totalVaultNotes, link: '/admin/vault' },
    { name: '태그', value: totalTags, link: '/admin/tags' },
  ];

  const quickActions = [
    { name: '새 포스트 작성', description: '블로그 포스트를 작성합니다', link: '/admin/posts/new' },
    { name: '새 피드 작성', description: '일상 피드를 작성합니다', link: '/admin/feed/new' },
    { name: '새 노트 작성', description: 'Vault 노트를 작성합니다', link: '/admin/vault/new' },
    { name: '채팅 관리', description: '방문자 실시간 채팅을 관리합니다', link: '/admin/chat' },
    { name: '카테고리 관리', description: '카테고리를 관리합니다', link: '/admin/categories' },
    { name: '태그 관리', description: '태그를 생성하고 관리합니다', link: '/admin/tags' },
  ];

  return (
    <>
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
    </>
  );
}
