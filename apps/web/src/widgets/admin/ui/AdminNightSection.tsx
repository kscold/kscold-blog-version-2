'use client';

import { Post } from '@/types/blog';
import { buildAdminNightActions, buildAdminNightQueue, buildAdminNightSlots } from '@/widgets/admin/lib/adminNight';
import { AdminNightCalendar } from './admin-night/AdminNightCalendar';
import { AdminNightPanels } from './admin-night/AdminNightPanels';

interface AdminNightSectionProps {
  viewerName: string;
  recentPosts: Post[];
  totalChatRooms: number;
  totalMessages: number;
}

export function AdminNightSection({
  viewerName,
  recentPosts,
  totalChatRooms,
  totalMessages,
}: AdminNightSectionProps) {
  const slots = buildAdminNightSlots(new Date());
  const queue = buildAdminNightQueue(recentPosts);
  const actions = buildAdminNightActions(recentPosts, totalChatRooms, totalMessages);

  const headlineName = viewerName ? `${viewerName}님` : '오늘 밤';
  const summaryPills = [
    `이번 주 슬롯 ${slots.length}칸`,
    `PR Queue ${queue.length}건`,
    `Reply Watch ${totalChatRooms}개 방`,
  ];

  return (
    <section
      data-cy="admin-night-section"
      className="mb-10 overflow-hidden rounded-[32px] border border-surface-200 bg-white shadow-sm"
    >
      <div className="border-b border-surface-200 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.08),_transparent_45%),linear-gradient(180deg,_rgba(248,250,252,0.96),_rgba(255,255,255,1))] px-5 py-6 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-surface-400">
              Admin Night
            </p>
            <h2 className="text-2xl font-black tracking-tight text-surface-900 sm:text-3xl">
              {headlineName}, 퇴근 후 같이 붙어 PR 올리는 보드
            </h2>
            <p className="text-sm leading-6 text-surface-500 sm:text-base">
              대시보드 메트릭 아래에서 오늘 밤 다듬을 초안, QA 루트, 답장 흐름을 캘린더처럼 한 번에 보도록 묶었습니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {summaryPills.map((pill) => (
              <span
                key={pill}
                className="rounded-full border border-surface-200 bg-white/80 px-3 py-1.5 text-xs font-bold text-surface-600 backdrop-blur"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:p-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.95fr)]">
        <AdminNightCalendar slots={slots} />
        <AdminNightPanels queue={queue} actions={actions} />
      </div>
    </section>
  );
}
