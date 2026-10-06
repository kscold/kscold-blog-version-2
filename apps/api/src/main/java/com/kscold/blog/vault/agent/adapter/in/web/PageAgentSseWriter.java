package com.kscold.blog.vault.agent.adapter.in.web;

import com.kscold.blog.vault.agent.application.dto.response.AgentStage;
import com.kscold.blog.vault.agent.application.dto.response.ChatResponse;
import com.kscold.blog.vault.agent.application.dto.response.SourceNote;
import com.kscold.blog.vault.agent.domain.model.AgentStreamEvent;
import java.io.IOException;
import java.util.Map;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

final class PageAgentSseWriter {

    private final SseEmitter emitter;
    private final ObjectMapper mapper;

    PageAgentSseWriter(SseEmitter emitter, ObjectMapper mapper) {
        this.emitter = emitter;
        this.mapper = mapper;
    }

    void sendEvent(AgentStreamEvent event) {
        switch (event.type()) {
            case STAGE ->
                    send("stage", new AgentStage(event.stage().name(), event.stage().detail()));
            case DELTA -> send("delta", Map.of("delta", event.delta()));
            case COMPLETED -> {
                var result = event.result();
                send(
                        "complete",
                        new ChatResponse(
                                "",
                                result.answer(),
                                result.stages().stream()
                                        .map(stage -> new AgentStage(stage.name(), stage.detail()))
                                        .toList(),
                                result.sources().stream()
                                        .map(
                                                source ->
                                                        new SourceNote(
                                                                source.id(),
                                                                source.title(),
                                                                source.slug(),
                                                                source.score(),
                                                                "page",
                                                                source.path(),
                                                                source.excerpt()))
                                        .toList(),
                                result.followUps()));
            }
        }
    }

    void sendError() {
        try {
            send("error", Map.of("message", "페이지 Agent 응답을 완료하지 못했습니다. 잠시 후 다시 시도해주세요."));
        } catch (IllegalStateException ignored) {
            // 연결이 이미 닫혔으면 오류 메시지도 전달하지 않는다.
        }
    }

    private void send(String name, Object payload) {
        try {
            emitter.send(SseEmitter.event().name(name).data(mapper.writeValueAsString(payload)));
        } catch (JacksonException exception) {
            throw new IllegalStateException("페이지 Agent 응답 형식 오류입니다.");
        } catch (IOException exception) {
            throw new IllegalStateException("페이지 Agent 연결이 종료되었습니다.");
        }
    }
}
