package com.kscold.blog.vault.agent.application.dto.command;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

/** 페이지 자료는 인용할 데이터일 뿐 권한이나 시스템 지시로 사용하지 않는다. */
public record PageChatCommand(
        @NotBlank @Size(max = 1200) @JsonDeserialize(using = StrictPageChatStringDeserializer.class)
                String message,
        @NotNull @Valid PageContext pageContext,
        @Size(max = 6) List<@NotNull @Valid ConversationMessage> conversation) {

    public PageChatCommand {
        conversation = conversation == null ? List.of() : List.copyOf(conversation);
    }

    @AssertTrue(message = "대화 문맥은 전체 3600자 이하여야 합니다.")
    public boolean isConversationBounded() {
        return conversation.stream()
                        .mapToInt(item -> item.content() == null ? 0 : item.content().length())
                        .sum()
                <= 3600;
    }

    @JsonAnySetter
    public void rejectUnknown(String name, Object value) {
        throw new IllegalArgumentException("지원하지 않는 페이지 질문 필드입니다.");
    }

    public record PageContext(
            @NotBlank
                    @Size(max = 120)
                    @JsonDeserialize(using = StrictPageChatStringDeserializer.class)
                    String title,
            @NotBlank
                    @Size(max = 160)
                    @Pattern(regexp = "^/[a-z0-9]+(?:-[a-z0-9]+)*(?:/[a-z0-9]+(?:-[a-z0-9]+)*)*/?$")
                    @JsonDeserialize(using = StrictPageChatStringDeserializer.class)
                    String path,
            @NotNull @Size(min = 1, max = 7) List<@NotNull @Valid Section> sections) {

        @AssertTrue(message = "페이지 자료는 전체 16000자 이하여야 합니다.")
        public boolean isContentBounded() {
            return sections == null
                    || sections.stream()
                                    .filter(item -> item != null)
                                    .mapToInt(
                                            item ->
                                                    item.content() == null
                                                            ? 0
                                                            : item.content().length())
                                    .sum()
                            <= 16000;
        }

        @AssertTrue(message = "페이지 자료의 앵커는 중복될 수 없습니다.")
        public boolean isSectionUnique() {
            return sections == null
                    || sections.stream()
                                    .filter(item -> item != null)
                                    .map(Section::id)
                                    .distinct()
                                    .count()
                            == sections.size();
        }

        @JsonAnySetter
        public void rejectUnknown(String name, Object value) {
            throw new IllegalArgumentException("지원하지 않는 페이지 자료 필드입니다.");
        }
    }

    public record Section(
            @NotBlank
                    @Size(max = 64)
                    @Pattern(regexp = "^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$")
                    @JsonDeserialize(using = StrictPageChatStringDeserializer.class)
                    String id,
            @NotBlank
                    @Size(max = 160)
                    @JsonDeserialize(using = StrictPageChatStringDeserializer.class)
                    String title,
            @NotBlank
                    @Size(max = 6000)
                    @JsonDeserialize(using = StrictPageChatStringDeserializer.class)
                    String content) {

        @JsonAnySetter
        public void rejectUnknown(String name, Object value) {
            throw new IllegalArgumentException("지원하지 않는 페이지 섹션 필드입니다.");
        }
    }

    public record ConversationMessage(
            @NotBlank
                    @Pattern(regexp = "^(user|assistant)$")
                    @JsonDeserialize(using = StrictPageChatStringDeserializer.class)
                    String role,
            @NotBlank
                    @Size(max = 1200)
                    @JsonDeserialize(using = StrictPageChatStringDeserializer.class)
                    String content) {

        @JsonAnySetter
        public void rejectUnknown(String name, Object value) {
            throw new IllegalArgumentException("지원하지 않는 대화 필드입니다.");
        }
    }
}
