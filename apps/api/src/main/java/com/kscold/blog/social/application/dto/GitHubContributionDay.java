package com.kscold.blog.social.application.dto;

public record GitHubContributionDay(
        String date,
        int count,
        int level
) {
}
