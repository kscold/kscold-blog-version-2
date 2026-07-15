package com.kscold.blog.social.application.dto.response;

import com.kscold.blog.social.domain.model.FeedCopilotDraft;
import java.util.List;

public record FeedCopilotDraftResponse(
        String title,
        String content,
        List<String> tags,
        List<FeedCopilotReferenceResponse> references) {

    public static FeedCopilotDraftResponse from(FeedCopilotDraft draft) {
        return new FeedCopilotDraftResponse(
                draft.title(),
                draft.content(),
                draft.tags(),
                draft.references().stream().map(FeedCopilotReferenceResponse::from).toList());
    }
}
