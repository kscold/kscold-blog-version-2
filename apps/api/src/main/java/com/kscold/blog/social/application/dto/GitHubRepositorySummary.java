package com.kscold.blog.social.application.dto;

public record GitHubRepositorySummary(
        String name,
        String url,
        String description,
        String language,
        int stars,
        String updatedAt
) {
}
