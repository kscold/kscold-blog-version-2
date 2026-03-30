package com.kscold.blog.social.application.dto;

import java.util.List;

public record GitHubContributionResponse(
        int total,
        List<GitHubContributionDay> days
) {}
