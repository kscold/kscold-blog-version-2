package com.kscold.blog.vault.agent.application.dto.command;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import java.util.List;
import org.junit.jupiter.api.Test;

class PageChatCommandValidationTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void acceptsBoundedPageSourcesWithoutSessionOrIdentity() {
        assertThat(validator.validate(valid())).isEmpty();
    }

    @Test
    void rejectsQuestionAndContextOverLimits() {
        assertThat(
                        validator.validate(
                                new PageChatCommand(
                                        "가".repeat(1201),
                                        context("/work-sample", "자료"),
                                        List.of())))
                .isNotEmpty();
        assertThat(
                        validator.validate(
                                new PageChatCommand(
                                        "질문",
                                        context("/work-sample", "가".repeat(6001)),
                                        List.of())))
                .isNotEmpty();
        var sources =
                List.of(
                        new PageChatCommand.Section("one", "자료1", "가".repeat(6000)),
                        new PageChatCommand.Section("two", "자료2", "가".repeat(6000)),
                        new PageChatCommand.Section("three", "자료3", "가".repeat(4001)));
        assertThat(
                        validator.validate(
                                new PageChatCommand(
                                        "질문",
                                        new PageChatCommand.PageContext(
                                                "문서", "/work-sample", sources),
                                        List.of())))
                .isNotEmpty();
    }

    @Test
    void rejectsUnsafePathsAndDuplicateAnchors() {
        for (String path :
                List.of(
                        "https://other.test/work",
                        "//other.test/work",
                        "/work?token=private",
                        "/work#anchor",
                        "/work/../admin",
                        "/work%2fadmin")) {
            assertThat(
                            validator.validate(
                                    new PageChatCommand("질문", context(path, "자료"), List.of())))
                    .isNotEmpty();
        }
        var section = new PageChatCommand.Section("one", "자료", "공개 설명");
        var duplicate =
                new PageChatCommand.PageContext("문서", "/work-sample", List.of(section, section));
        assertThat(validator.validate(new PageChatCommand("질문", duplicate, List.of())))
                .isNotEmpty();
    }

    @Test
    void rejectsSystemRoleAndOversizedConversation() {
        var context = valid().pageContext();
        assertThat(
                        validator.validate(
                                new PageChatCommand(
                                        "질문",
                                        context,
                                        List.of(
                                                new PageChatCommand.ConversationMessage(
                                                        "system", "권한 상승")))))
                .isNotEmpty();
        var item = new PageChatCommand.ConversationMessage("user", "가".repeat(1200));
        assertThat(
                        validator.validate(
                                new PageChatCommand(
                                        "질문", context, List.of(item, item, item, item))))
                .isNotEmpty();
        assertThat(
                        validator.validate(
                                new PageChatCommand(
                                        "질문",
                                        context,
                                        List.of(
                                                new PageChatCommand.ConversationMessage(
                                                        "assistant", null)))))
                .isNotEmpty();
    }

    @Test
    void rejectsUnknownFieldsEvenWhenGlobalMapperIgnoresThem() {
        ObjectMapper mapper =
                new ObjectMapper().disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        String base =
                "{\"message\":\"질문\",\"pageContext\":{\"title\":\"문서\",\"path\":\"/work-sample\",\"sections\":[{\"id\":\"one\",\"title\":\"자료\",\"content\":\"공개 설명\"}]}}";
        assertThatThrownBy(
                        () ->
                                mapper.readValue(
                                        base.replace(
                                                "\"message\":",
                                                "\"userId\":\"administrator\",\"message\":"),
                                        PageChatCommand.class))
                .isInstanceOf(com.fasterxml.jackson.core.JsonProcessingException.class);
        assertThatThrownBy(
                        () ->
                                mapper.readValue(
                                        base.replace(
                                                "\"title\":\"문서\"",
                                                "\"fullContentAccess\":true,\"title\":\"문서\""),
                                        PageChatCommand.class))
                .isInstanceOf(com.fasterxml.jackson.core.JsonProcessingException.class);
        assertThatThrownBy(
                        () ->
                                mapper.readValue(
                                        base.replace(
                                                "\"id\":\"one\"",
                                                "\"instructions\":\"권한 상승\",\"id\":\"one\""),
                                        PageChatCommand.class))
                .isInstanceOf(com.fasterxml.jackson.core.JsonProcessingException.class);
    }

    static PageChatCommand valid() {
        return new PageChatCommand(
                "자료를 설명해줘", context("/work-sample", "팀과 협업해 공개 서비스를 운영했다."), List.of());
    }

    @Test
    void rejectsNumbersAndBooleansInsteadOfCoercingThemToText() {
        ObjectMapper mapper = new ObjectMapper();
        String base =
                "{\"message\":\"질문\",\"pageContext\":{\"title\":\"문서\",\"path\":\"/work-sample\",\"sections\":[{\"id\":\"one\",\"title\":\"자료\",\"content\":\"공개 설명\"}]}}";
        assertThatThrownBy(
                        () ->
                                mapper.readValue(
                                        base.replace("\"message\":\"질문\"", "\"message\":123"),
                                        PageChatCommand.class))
                .isInstanceOf(com.fasterxml.jackson.core.JsonProcessingException.class);
        assertThatThrownBy(
                        () ->
                                mapper.readValue(
                                        base.replace("\"title\":\"자료\"", "\"title\":true"),
                                        PageChatCommand.class))
                .isInstanceOf(com.fasterxml.jackson.core.JsonProcessingException.class);
    }

    private static PageChatCommand.PageContext context(String path, String content) {
        return new PageChatCommand.PageContext(
                "작업 소개", path, List.of(new PageChatCommand.Section("one", "팀 프로젝트", content)));
    }
}
