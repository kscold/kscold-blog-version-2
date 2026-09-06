package com.kscold.blog.vault.agent.adapter.out.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.kscold.blog.vault.agent.domain.model.AgentChatMessage;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;

@ExtendWith(MockitoExtension.class)
class MongoVaultAgentChatHistoryRepositoryTest {

    @Mock private MongoTemplate mongoTemplate;

    @Test
    @DisplayName("시나리오: 최신 대화 N개를 선택하고 화면에는 시간순으로 반환한다")
    void findsLatestMessagesAndReturnsChronologicalOrder() {
        ObjectId olderId = new ObjectId("000000000000000000000001");
        ObjectId newerId = new ObjectId("000000000000000000000002");
        Instant createdAt = Instant.parse("2026-09-06T00:00:00Z");
        Document newer = messageDocument(newerId, "assistant", createdAt);
        Document older = messageDocument(olderId, "user", createdAt);
        when(mongoTemplate.find(
                        any(Query.class), eq(Document.class), eq("vault_agent_chat_messages")))
                .thenReturn(List.of(newer, older));
        MongoVaultAgentChatHistoryRepository repository =
                new MongoVaultAgentChatHistoryRepository(mongoTemplate);

        List<AgentChatMessage> result = repository.findLatestByScopeKey("user:1:session-1", 2);

        ArgumentCaptor<Query> queryCaptor = ArgumentCaptor.forClass(Query.class);
        org.mockito.Mockito.verify(mongoTemplate)
                .find(queryCaptor.capture(), eq(Document.class), eq("vault_agent_chat_messages"));
        Query query = queryCaptor.getValue();
        assertThat(query.getQueryObject()).isEqualTo(new Document("scopeKey", "user:1:session-1"));
        assertThat(query.getSortObject())
                .isEqualTo(new Document("createdAt", -1).append("_id", -1));
        assertThat(query.getLimit()).isEqualTo(2);
        assertThat(result)
                .extracting(AgentChatMessage::id)
                .containsExactly(olderId.toHexString(), newerId.toHexString());
    }

    private Document messageDocument(ObjectId id, String role, Instant createdAt) {
        return new Document("_id", id)
                .append("scopeKey", "user:1:session-1")
                .append("sessionId", "session-1")
                .append("userId", "user-1")
                .append("clientIdentifier", "")
                .append("role", role)
                .append("content", role)
                .append("createdAt", Date.from(createdAt));
    }
}
