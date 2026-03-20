import { useEffect, useState } from 'react';

export interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface GitHubStats {
  total: number;
  days: ContributionDay[];
}

export function useGitHubContributions(username: string) {
  const [data, setData] = useState<GitHubStats | null>(null);

  useEffect(() => {
    const year = new Date().getFullYear();
    const api = `https://github-contributions-api.jogruber.de/v4/${username}`;
    Promise.all([
      fetch(`${api}?y=${year}`).then(r => r.json()),
      fetch(`${api}?y=${year - 1}`).then(r => r.json()),
    ])
      .then(([curr, prev]) => {
        const allDays = [...(prev.contributions ?? []), ...(curr.contributions ?? [])];
        const today = new Date().toISOString().split('T')[0];
        const pastDays = allDays.filter((d: ContributionDay) => d.date <= today);
        const last365 = pastDays.slice(-365);
        const total = last365.reduce((sum: number, d: ContributionDay) => sum + d.count, 0);
        setData({ total, days: last365 });
      })
      .catch(() => {});
  }, [username]);

  return data;
}
