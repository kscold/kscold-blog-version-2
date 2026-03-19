'use client';

import { use } from 'react';
import { TeamDetailPage } from '@/widgets/info/ui/TeamDetailPage';

export default function Page({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = use(params);
  return <TeamDetailPage teamId={teamId} />;
}
