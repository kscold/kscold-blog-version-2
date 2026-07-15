package com.kscold.blog.social.application.dto.response;

import com.kscold.blog.social.domain.model.FeedCopilotReference;

public record FeedCopilotReferenceResponse(
        String id,
        String title,
        String slug,
        double score,
        String type,
        String path,
        String excerpt) {

    public static FeedCopilotReferenceResponse from(FeedCopilotReference reference) {
        return new FeedCopilotReferenceResponse(
                reference.id(),
                reference.title(),
                reference.slug(),
                reference.score(),
                reference.type(),
                reference.path(),
                reference.excerpt());
    }
}
