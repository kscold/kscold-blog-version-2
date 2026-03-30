package com.kscold.blog.social.application.service;

import com.kscold.blog.social.application.dto.GitHubContributionResponse;
import com.kscold.blog.social.application.dto.GitHubOverviewResponse;
import com.kscold.blog.social.application.port.in.GitHubUseCase;
import com.kscold.blog.social.domain.port.out.GitHubPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GitHubApplicationService implements GitHubUseCase {

    private final GitHubPort gitHubPort;

    @Override
    public GitHubContributionResponse getContributions(String username, Integer year) {
        var result = year != null
                ? gitHubPort.fetchContributionDays(username, year)
                : gitHubPort.fetchContributionDays(username);
        return new GitHubContributionResponse(result.total(), result.days());
    }

    @Override
    public GitHubOverviewResponse getOverview(String username) {
        var profile = gitHubPort.fetchProfile(username);
        var result = gitHubPort.fetchContributionDays(username);
        return new GitHubOverviewResponse(
                profile.username(), profile.displayName(), profile.avatarUrl(),
                profile.profileUrl(), profile.bio(), profile.followers(),
                profile.following(), profile.publicRepos(),
                result.total(), result.days(),
                gitHubPort.fetchTopRepositories(username)
        );
    }
}
