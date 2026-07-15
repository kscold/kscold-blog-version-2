package com.kscold.blog.vault.agent.domain.model;

public record AgentSource(
        String id, String title, String slug, double score, String type, String path) {}
