'use client';

import { useState } from 'react';
import { apiClient } from '@/shared/api/api-client';
import type { PrivateDocs } from '@/entities/profile/model/teamData';

export function useTeamPrivate(teamId: string) {
  const [docs, setDocs] = useState<PrivateDocs | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const unlock = async (password: string) => {
    if (!password.trim() || loading) return;
    setLoading(true);
    setError(false);
    try {
      const res = await apiClient.post<PrivateDocs>('/team/private', { password, teamId });
      setDocs(res);
      setUnlocked(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return { docs, unlocked, loading, error, unlock };
}
