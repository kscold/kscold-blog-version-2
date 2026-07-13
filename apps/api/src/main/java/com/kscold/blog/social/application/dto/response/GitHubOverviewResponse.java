package com.kscold.blog.social.application.dto.response;

import com.kscold.blog.social.domain.model.GitHubContributionDay;
import com.kscold.blog.social.domain.model.GitHubRepositorySummary;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class GitHubOverviewResponse {

    private String username;

    private String displayName;

    private String avatarUrl;

    private String profileUrl;

    private String bio;

    private int followers;

    private int following;

    private int publicRepos;

    private int totalContributions;

    private List<GitHubContributionDay> days;

    private List<GitHubRepositorySummary> topRepositories;
}
