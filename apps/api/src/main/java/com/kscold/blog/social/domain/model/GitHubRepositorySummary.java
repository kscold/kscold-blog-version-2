package com.kscold.blog.social.domain.model;

public record GitHubRepositorySummary(
        String name,
        String url,
        String description,
        String language,
        int stars,
        String updatedAt) {}
