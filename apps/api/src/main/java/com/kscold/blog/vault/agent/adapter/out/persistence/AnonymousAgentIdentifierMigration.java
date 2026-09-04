package com.kscold.blog.vault.agent.adapter.out.persistence;

import com.kscold.blog.shared.security.OneWayIdentifierHasher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

/** 과거 Vault Agent 대화에 저장된 IP 기반 클라이언트 식별자를 단방향 값으로 치환한다. */
@Slf4j
@Component
@RequiredArgsConstructor
public class AnonymousAgentIdentifierMigration implements ApplicationRunner {

    private static final String COLLECTION = "vault_agent_chat_messages";

    private final MongoTemplate mongoTemplate;

    @Override
    public void run(ApplicationArguments args) {
        Query legacyQuery = Query.query(Criteria.where("clientIdentifier").regex("\\|"));
        legacyQuery
                .fields()
                .include("_id")
                .include("scopeKey")
                .include("sessionId")
                .include("clientIdentifier");

        long migrated = 0;
        for (Document document : mongoTemplate.find(legacyQuery, Document.class, COLLECTION)) {
            String rawIdentifier = stringValue(document.get("clientIdentifier"));
            if (!rawIdentifier.contains("|")) {
                continue;
            }
            String hashedIdentifier = OneWayIdentifierHasher.hash(rawIdentifier);
            Update update = new Update().set("clientIdentifier", hashedIdentifier);
            String scopeKey = stringValue(document.get("scopeKey"));
            String sessionId = stringValue(document.get("sessionId"));
            if (scopeKey.startsWith("guest:") && !sessionId.isBlank()) {
                update.set("scopeKey", "guest:%s:%s".formatted(hashedIdentifier, sessionId));
            }
            mongoTemplate.updateFirst(
                    Query.query(Criteria.where("_id").is(document.get("_id"))), update, COLLECTION);
            migrated++;
        }
        if (migrated > 0) {
            log.info("Vault Agent 익명 식별자 마이그레이션 완료: messages={}", migrated);
        }
    }

    private String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value);
    }
}
