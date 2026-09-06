package com.kscold.blog.vault.agent.adapter.out.persistence;

import com.mongodb.client.model.IndexOptions;
import lombok.RequiredArgsConstructor;
import org.bson.Document;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class VaultAgentChatHistoryIndexMigration implements ApplicationRunner {

    static final String COLLECTION = "vault_agent_chat_messages";
    static final String INDEX_NAME = "scopeKey_createdAt_id_idx";

    private final MongoTemplate mongoTemplate;

    @Override
    public void run(ApplicationArguments args) {
        mongoTemplate
                .getCollection(COLLECTION)
                .createIndex(
                        new Document("scopeKey", 1).append("createdAt", -1).append("_id", -1),
                        new IndexOptions().name(INDEX_NAME));
    }
}
