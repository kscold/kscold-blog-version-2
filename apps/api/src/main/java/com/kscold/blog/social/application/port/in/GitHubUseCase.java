package com.kscold.blog.social.application.port.in;

import com.kscold.blog.social.application.dto.GitHubContributionResponse;
import com.kscold.blog.social.application.dto.GitHubOverviewResponse;

public interface GitHubUseCase {

    GitHubOverviewResponse getOverview(String username);

    GitHubContributionResponse getContributions(String username, Integer year);
}
