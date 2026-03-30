export interface GitHubContributionDay {
  date: string;
  count: number;
  level: number;
}

export interface GitHubRepositorySummary {
  name: string;
  url: string;
  description: string;
  language: string;
  stars: number;
  updatedAt: string;
}

export interface GitHubOverview {
  username: string;
  displayName: string;
  avatarUrl: string;
  profileUrl: string;
  bio: string;
  followers: number;
  following: number;
  publicRepos: number;
  totalContributions: number;
  days: GitHubContributionDay[];
  topRepositories: GitHubRepositorySummary[];
}
