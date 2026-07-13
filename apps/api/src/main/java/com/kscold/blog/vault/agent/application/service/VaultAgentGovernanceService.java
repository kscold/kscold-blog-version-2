package com.kscold.blog.vault.agent.application.service;

import com.kscold.blog.vault.agent.application.dto.AgentRunResponse;
import com.kscold.blog.vault.agent.application.dto.SourceNote;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class VaultAgentGovernanceService {

    private static final String COLLECTION = "vault_agent_runs";
    private static final int ANSWER_PREVIEW_LENGTH = 320;

    private final MongoTemplate mongoTemplate;

    public Page<AgentRunResponse> getRuns(Pageable pageable) {
        var query = new Query().with(pageable);
        List<AgentRunResponse> content =
                mongoTemplate.find(query, Document.class, COLLECTION).stream()
                        .map(this::toResponse)
                        .toList();
        long total = mongoTemplate.count(new Query(), COLLECTION);
        return new PageImpl<>(content, pageable, total);
    }

    @SuppressWarnings("unchecked")
    private AgentRunResponse toResponse(Document document) {
        List<SourceNote> sources =
                ((List<Document>) document.getOrDefault("sources", List.of()))
                        .stream()
                                .map(
                                        source ->
                                                new SourceNote(
                                                        toStringValue(source.get("noteId")),
                                                        toStringValue(source.get("title")),
                                                        toStringValue(source.get("slug")),
                                                        toDouble(source.get("score")),
                                                        toStringValue(source.get("type")),
                                                        toStringValue(source.get("path"))))
                                .toList();
        return new AgentRunResponse(
                toStringValue(document.get("_id")),
                toStringValue(document.get("question")),
                preview(toStringValue(document.get("answer"))),
                document.getInteger("sourceCount", sources.size()),
                sources,
                toInstant(document.get("createdAt")));
    }

    private String preview(String value) {
        if (value.length() <= ANSWER_PREVIEW_LENGTH) {
            return value;
        }
        return value.substring(0, ANSWER_PREVIEW_LENGTH).trim() + "…";
    }

    private String toStringValue(Object value) {
        if (value == null) {
            return "";
        }
        if (value instanceof ObjectId objectId) {
            return objectId.toHexString();
        }
        return String.valueOf(value);
    }

    private double toDouble(Object value) {
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        return 0;
    }

    private Instant toInstant(Object value) {
        if (value instanceof Date date) {
            return date.toInstant();
        }
        if (value instanceof Instant instant) {
            return instant;
        }
        return null;
    }
}
