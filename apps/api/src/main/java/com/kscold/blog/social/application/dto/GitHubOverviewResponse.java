package com.kscold.blog.social.application.dto;

import java.util.List;

public record GitHubOverviewResponse(
        String username,
        String displayName,
        String avatarUrl,
        String profileUrl,
        String bio,
        int followers,
        int following,
        int publicRepos,
        int totalContributions,
        List<GitHubContributionDay> days,
        List<GitHubRepositorySummary> topRepositories
) {
}
