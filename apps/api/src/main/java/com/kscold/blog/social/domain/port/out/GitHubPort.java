package com.kscold.blog.social.domain.port.out;

import com.kscold.blog.social.application.dto.GitHubContributionDay;
import com.kscold.blog.social.application.dto.GitHubRepositorySummary;

import java.util.List;

public interface GitHubPort {

    GitHubProfileSnapshot fetchProfile(String username);

    ContributionResult fetchContributionDays(String username);

    ContributionResult fetchContributionDays(String username, int year);

    List<GitHubRepositorySummary> fetchTopRepositories(String username);

    record ContributionResult(List<GitHubContributionDay> days, int total) {}

    record GitHubProfileSnapshot(
            String username,
            String displayName,
            String avatarUrl,
            String profileUrl,
            String bio,
            int followers,
            int following,
            int publicRepos
    ) {
    }
}
