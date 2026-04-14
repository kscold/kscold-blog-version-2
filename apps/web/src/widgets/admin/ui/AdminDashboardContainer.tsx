'use client';

import { useAdminPosts } from '@/entities/post/api/usePosts';
import { useCategories } from '@/entities/category/api/useCategories';
import { useFeeds } from '@/entities/feed/api/useFeeds';
import { useAllVaultNotes } from '@/entities/vault/api/useVault';
import { useTags } from '@/entities/tag/api/useTags';
import { fetchChatRooms } from '@/entities/chat/api/chatAdminApi';
import { useQuery } from '@tanstack/react-query';
import { useViewer } from '@/entities/user/model/useViewer';
import { DashboardStats } from './DashboardStats';
import { AdminUserStatsSection } from './AdminUserStatsSection';

export function AdminDashboardContainer() {
  const { user, role } = useViewer();
  const { data: postsData } = useAdminPosts(0, 5);
  const { data: allPostsData } = useAdminPosts(0, 1);
  const { data: categories } = useCategories();
  const { data: feedsData } = useFeeds({ page: 0, size: 1 });
  const { data: vaultData } = useAllVaultNotes(0, 1);
  const { data: tagsData } = useTags();
  const { data: chatRooms } = useQuery({
    queryKey: ['admin', 'chat', 'rooms'],
    queryFn: fetchChatRooms,
    refetchInterval: 30000,
  });

  const posts = postsData?.content || [];
  const totalPosts = allPostsData?.totalElements || 0;
  const totalFeeds = feedsData?.totalElements || 0;
  const totalVaultNotes = vaultData?.totalElements || 0;
  const totalTags = tagsData?.length || 0;
  const totalChatRooms = chatRooms?.length || 0;
  const totalMessages = chatRooms?.reduce((sum, r) => sum + r.messageCount, 0) || 0;
  const viewerName =
    user?.displayName ||
    user?.username ||
    (role === 'ADMIN' ? '관리자' : role === 'USER' ? '회원' : '');

  const stats = [
    { name: '전체 포스트', value: totalPosts, link: '/admin/posts' },
    { name: '카테고리', value: categories?.length || 0, link: '/admin/categories' },
    { name: '피드', value: totalFeeds, link: '/admin/feed' },
    { name: 'Vault 노트', value: totalVaultNotes, link: '/admin/vault' },
    { name: '태그', value: totalTags, link: '/admin/tags' },
    { name: '채팅 방', value: totalChatRooms, link: '/admin/chat' },
    { name: '총 메시지', value: totalMessages, link: '/admin/chat' },
  ];

  const quickActions = [
    { name: '새 포스트 작성', description: '블로그 포스트를 작성합니다', link: '/admin/posts/new' },
    { name: '새 피드 작성', description: '일상 피드를 작성합니다', link: '/admin/feed/new' },
    { name: '새 노트 작성', description: 'Vault 노트를 작성합니다', link: '/admin/vault/new' },
    { name: '채팅 관리', description: '방문자 실시간 채팅을 관리합니다', link: '/admin/chat' },
    { name: '스토리지 관리', description: 'blog 버킷 파일과 폴더를 관리합니다', link: '/admin/storage', dataCy: 'admin-storage-link' },
    { name: 'Admin Night 관리', description: '참가 신청을 승인하고 일정을 merge 합니다', link: '/admin/admin-night' },
    { name: '카테고리 관리', description: '카테고리를 관리합니다', link: '/admin/categories' },
    { name: '태그 관리', description: '태그를 생성하고 관리합니다', link: '/admin/tags' },
    { name: '열람 요청 관리', description: '글 열람 권한 요청을 승인/거절합니다', link: '/admin/access-requests' },
    {
      name: 'QA / E2E',
      description: '시나리오 링크와 Cypress 실행 명령을 확인합니다',
      link: '/admin/testing',
      dataCy: 'admin-qa-link',
    },
  ];

  return (
    <>
      <div className="mb-10 space-y-3">
        <h1 className="text-3xl font-sans font-black tracking-tighter text-surface-900 sm:text-4xl">
          Dashboard
        </h1>
        <p className="text-sm leading-6 text-surface-500 sm:text-base">
          {viewerName}
        </p>
      </div>

      <DashboardStats
        stats={stats}
        quickActions={quickActions}
        recentPosts={posts}
      />

      <div className="mt-12 space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-surface-900">가입자 현황</h2>
          <p className="text-sm leading-6 text-surface-500">
            최근 가입 흐름과 신규 사용자 목록을 한눈에 확인할 수 있습니다.
          </p>
        </div>
        <AdminUserStatsSection />
      </div>
    </>
  );
}
