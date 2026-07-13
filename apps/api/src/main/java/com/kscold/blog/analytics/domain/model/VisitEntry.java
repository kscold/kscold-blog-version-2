package com.kscold.blog.analytics.domain.model;

/** 최근 방문 히스토리 항목 */
public record VisitEntry(String path, String userId, String username, String visitedAt) {
    public static VisitEntry from(PageVisitLog log) {
        return new VisitEntry(
                log.getPath(),
                log.getUserId(),
                log.getUsername(),
                log.getCreatedAt() != null ? log.getCreatedAt().toString() : "");
    }
}
