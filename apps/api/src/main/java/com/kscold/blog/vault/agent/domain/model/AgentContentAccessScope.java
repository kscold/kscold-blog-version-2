package com.kscold.blog.vault.agent.domain.model;

import java.util.Set;

public record AgentContentAccessScope(
        boolean fullContentAccess, Set<String> allowedPostIds, Set<String> allowedCategoryIds) {

    public AgentContentAccessScope {
        allowedPostIds = Set.copyOf(allowedPostIds == null ? Set.of() : allowedPostIds);
        allowedCategoryIds = Set.copyOf(allowedCategoryIds == null ? Set.of() : allowedCategoryIds);
    }

    public static AgentContentAccessScope publicOnly() {
        return new AgentContentAccessScope(false, Set.of(), Set.of());
    }

    public static AgentContentAccessScope fullAccess() {
        return new AgentContentAccessScope(true, Set.of(), Set.of());
    }

    public boolean hasAdditionalAccess() {
        return !fullContentAccess && (!allowedPostIds.isEmpty() || !allowedCategoryIds.isEmpty());
    }
}
