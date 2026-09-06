package com.kscold.blog.vault.agent.adapter.out.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.IndexOptions;
import org.bson.Document;
import org.bson.conversions.Bson;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.mongodb.core.MongoTemplate;

class VaultAgentChatHistoryIndexMigrationTest {

    @Test
    @DisplayName("시나리오: Vault Agent 최신 이력 조회용 복합 인덱스를 보장한다")
    void createsScopeAndDescendingTimeIndex() {
        MongoTemplate mongoTemplate = mock(MongoTemplate.class);
        @SuppressWarnings("unchecked")
        MongoCollection<Document> collection = mock(MongoCollection.class);
        when(mongoTemplate.getCollection(VaultAgentChatHistoryIndexMigration.COLLECTION))
                .thenReturn(collection);
        VaultAgentChatHistoryIndexMigration migration =
                new VaultAgentChatHistoryIndexMigration(mongoTemplate);

        migration.run(null);

        ArgumentCaptor<Bson> keysCaptor = ArgumentCaptor.forClass(Bson.class);
        ArgumentCaptor<IndexOptions> optionsCaptor = ArgumentCaptor.forClass(IndexOptions.class);
        verify(collection).createIndex(keysCaptor.capture(), optionsCaptor.capture());
        assertThat(keysCaptor.getValue())
                .isEqualTo(new Document("scopeKey", 1).append("createdAt", -1).append("_id", -1));
        assertThat(optionsCaptor.getValue().getName())
                .isEqualTo(VaultAgentChatHistoryIndexMigration.INDEX_NAME);
    }
}
