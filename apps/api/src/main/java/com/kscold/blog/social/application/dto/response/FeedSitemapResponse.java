package com.kscold.blog.social.application.dto.response;

import java.time.Instant;

/** 사이트맵 색인 판정과 수정일 생성에 필요한 최소 피드 정보. */
public record FeedSitemapResponse(
        String id, int contentLength, Instant createdAt, Instant updatedAt) {}
