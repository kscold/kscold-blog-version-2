package com.kscold.blog.social.domain.model;

/** 피드 초안에 활용한 KSCOLD 내부 기록의 이동 가능한 근거 정보입니다. */
public record FeedCopilotReference(
        String id,
        String title,
        String slug,
        double score,
        String type,
        String path,
        String excerpt) {}
