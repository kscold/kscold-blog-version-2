package com.kscold.blog.vault.agent.domain.model;

public record AgentSearchQuery(String query, String activeFolderName, int limit) {}
