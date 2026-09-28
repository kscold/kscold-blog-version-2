package com.kscold.blog.vault.agent.domain.model;

import java.util.List;

/** 인증 주체와 저장용 식별자를 포함하지 않는 일회성 페이지 질문이다. */
public record PageAgentQuery(
        String message, Context context, List<ConversationMessage> conversation) {

    public PageAgentQuery {
        conversation = List.copyOf(conversation);
    }

    public record Context(String title, String path, List<Section> sections) {
        public Context {
            sections = List.copyOf(sections);
        }
    }

    public record Section(String id, String title, String content) {}

    public record ConversationMessage(String role, String content) {}
}
