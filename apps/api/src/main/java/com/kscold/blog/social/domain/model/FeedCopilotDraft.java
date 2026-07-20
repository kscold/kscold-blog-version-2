package com.kscold.blog.social.domain.model;

import java.util.List;

/** 작성 화면에 적용하기 전까지는 발행되지 않는 피드 초안. */
public record FeedCopilotDraft(
        String title, String content, List<String> tags, List<FeedCopilotReference> references) {

    public FeedCopilotDraft {
        title = title == null ? "" : title;
        content = content == null ? "" : content;
        tags = List.copyOf(tags == null ? List.of() : tags);
        references = List.copyOf(references == null ? List.of() : references);
    }
}
