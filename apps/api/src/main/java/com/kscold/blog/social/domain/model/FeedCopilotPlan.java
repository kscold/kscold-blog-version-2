package com.kscold.blog.social.domain.model;

import java.util.List;

/** 자동 발행 전 작성자가 검토할 피드 초안의 방향. */
public record FeedCopilotPlan(
        String title,
        String angle,
        List<String> keyPoints,
        String sourceSummary,
        List<FeedCopilotReference> references) {

    public FeedCopilotPlan {
        title = title == null ? "" : title;
        angle = angle == null ? "" : angle;
        keyPoints = List.copyOf(keyPoints == null ? List.of() : keyPoints);
        sourceSummary = sourceSummary == null ? "" : sourceSummary;
        references = List.copyOf(references == null ? List.of() : references);
    }
}
