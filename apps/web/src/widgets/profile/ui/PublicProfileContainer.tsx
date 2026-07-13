'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePublicProfile, useUserFeeds } from '@/features/profile/api/useProfile';
import { ProfileHeaderCard } from './ProfileHeaderCard';
import { ProfileFeedList } from './ProfileFeedList';

interface Props {
  username: string;
}

export function PublicProfileContainer({ username }: Props) {
  const { data: profile, isLoading: profileLoading, isError } = usePublicProfile(username);
  const [page, setPage] = useState(0);
  const { data: feedsData, isLoading: feedsLoading } = useUserFeeds(username, page);

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-surface-300 border-t-surface-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-surface-500 text-lg">사용자를 찾을 수 없습니다.</p>
        <Link href="/feed" className="text-sm text-surface-400 hover:text-surface-700 transition-colors">
          피드로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6">
        {/* 프로필 헤더 */}
        <ProfileHeaderCard profile={profile} />

        {/* 피드 목록 */}
        <ProfileFeedList
          feedsData={feedsData}
          feedsLoading={feedsLoading}
          page={page}
          setPage={setPage}
        />
      </div>
    </div>
  );
}
