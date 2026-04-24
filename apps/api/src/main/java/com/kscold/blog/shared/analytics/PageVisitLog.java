package com.kscold.blog.shared.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * 페이지 방문 로그 (어드민 분석용)
 * - 90일 TTL
 * - path별 일별 집계에 사용
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "page_visit_logs")
public class PageVisitLog {

    @Id
    private String id;

    @Indexed
    private String path;        // 정규화된 경로

    private String ipHash;

    /** 로그인한 경우 userId (익명이면 null) */
    @Indexed(sparse = true)
    private String userId;

    /** 표시용 이름 (denormalized) */
    private String username;

    @Indexed(expireAfterSeconds = 7776000) // 90일
    private Instant createdAt;
}
