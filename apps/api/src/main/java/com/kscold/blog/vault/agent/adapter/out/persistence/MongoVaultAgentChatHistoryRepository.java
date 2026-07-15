package com.kscold.blog.vault.agent.adapter.out.persistence;

import com.kscold.blog.vault.agent.domain.model.AgentChatMessage;
import com.kscold.blog.vault.agent.domain.model.AgentChatStage;
import com.kscold.blog.vault.agent.domain.model.AgentSource;
import com.kscold.blog.vault.agent.domain.port.out.VaultAgentChatHistoryRepository;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MongoVaultAgentChatHistoryRepository implements VaultAgentChatHistoryRepository {

    private static final String COLLECTION = "vault_agent_chat_messages";

    private final MongoTemplate mongoTemplate;

    @Override
    public void save(AgentChatMessage message) {
        mongoTemplate.insert(
                new Document()
                        .append("scopeKey", message.scopeKey())
                        .append("sessionId", message.sessionId())
                        .append("userId", message.userId())
                        .append("clientIdentifier", message.clientIdentifier())
                        .append("role", message.role())
                        .append("content", message.content())
                        .append(
                                "stages",
                                message.stages().stream()
                                        .map(
                                                stage ->
                                                        new Document("name", stage.name())
                                                                .append("detail", stage.detail()))
                                        .toList())
                        .append(
                                "sources",
                                message.sources().stream()
                                        .map(
                                                source ->
                                                        new Document("id", source.id())
                                                                .append("title", source.title())
                                                                .append("slug", source.slug())
                                                                .append("score", source.score())
                                                                .append("type", source.type())
                                                                .append("path", source.path())
                                                                .append(
                                                                        "excerpt",
                                                                        source.excerpt()))
                                        .toList())
                        .append("createdAt", Date.from(message.createdAt())),
                COLLECTION);
    }

    @Override
    public List<AgentChatMessage> findByScopeKey(String scopeKey, int limit) {
        Query query =
                Query.query(Criteria.where("scopeKey").is(scopeKey))
                        .with(Sort.by(Sort.Direction.ASC, "createdAt"))
                        .limit(limit);
        return mongoTemplate.find(query, Document.class, COLLECTION).stream()
                .map(this::toMessage)
                .toList();
    }

    @SuppressWarnings("unchecked")
    private AgentChatMessage toMessage(Document document) {
        List<AgentChatStage> stages =
                ((List<Document>) document.getOrDefault("stages", List.of()))
                        .stream()
                                .map(
                                        stage ->
                                                new AgentChatStage(
                                                        stringValue(stage.get("name")),
                                                        stringValue(stage.get("detail"))))
                                .toList();
        List<AgentSource> sources =
                ((List<Document>) document.getOrDefault("sources", List.of()))
                        .stream()
                                .map(
                                        source ->
                                                new AgentSource(
                                                        stringValue(source.get("id")),
                                                        stringValue(source.get("title")),
                                                        stringValue(source.get("slug")),
                                                        doubleValue(source.get("score")),
                                                        stringValue(source.get("type")),
                                                        stringValue(source.get("path")),
                                                        stringValue(source.get("excerpt"))))
                                .toList();
        return new AgentChatMessage(
                stringValue(document.get("_id")),
                stringValue(document.get("scopeKey")),
                stringValue(document.get("sessionId")),
                stringValue(document.get("userId")),
                stringValue(document.get("clientIdentifier")),
                stringValue(document.get("role")),
                stringValue(document.get("content")),
                stages,
                sources,
                instantValue(document.get("createdAt")));
    }

    private String stringValue(Object value) {
        if (value == null) {
            return "";
        }
        if (value instanceof ObjectId objectId) {
            return objectId.toHexString();
        }
        return String.valueOf(value);
    }

    private double doubleValue(Object value) {
        return value instanceof Number number ? number.doubleValue() : 0;
    }

    private Instant instantValue(Object value) {
        if (value instanceof Date date) {
            return date.toInstant();
        }
        if (value instanceof Instant instant) {
            return instant;
        }
        return Instant.EPOCH;
    }
}
