package com.kscold.blog.social.application.dto.response;

import com.kscold.blog.social.domain.model.FeedCopilotPlan;
import java.util.List;

public record FeedCopilotPlanResponse(
        String title,
        String angle,
        List<String> keyPoints,
        String sourceSummary,
        List<FeedCopilotReferenceResponse> references) {

    public static FeedCopilotPlanResponse from(FeedCopilotPlan plan) {
        return new FeedCopilotPlanResponse(
                plan.title(),
                plan.angle(),
                plan.keyPoints(),
                plan.sourceSummary(),
                plan.references().stream().map(FeedCopilotReferenceResponse::from).toList());
    }
}
