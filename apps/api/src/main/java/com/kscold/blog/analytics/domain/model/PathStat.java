package com.kscold.blog.analytics.domain.model;

/** path별 방문 통계 (방문수 · 고유 방문자수) */
public record PathStat(String path, long visits, long uniqueVisitors) {}
