package com.kscold.blog.vault.agent.adapter.out.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.shared.security.OneWayIdentifierHasher;
import java.util.List;
import org.bson.Document;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

class AnonymousAgentIdentifierMigrationTest {

    @Test
    void 익명_대화의_식별자와_scopeKey를_같은_해시로_치환한다() {
        MongoTemplate mongoTemplate = mock(MongoTemplate.class);
        String rawIdentifier = "203.0.113.10|browser";
        String hashedIdentifier = OneWayIdentifierHasher.hash(rawIdentifier);
        Document message =
                new Document("_id", "message-id")
                        .append("clientIdentifier", rawIdentifier)
                        .append("sessionId", "session-id")
                        .append("scopeKey", "guest:%s:session-id".formatted(rawIdentifier));
        when(mongoTemplate.find(
                        any(Query.class), eq(Document.class), eq("vault_agent_chat_messages")))
                .thenReturn(List.of(message));

        new AnonymousAgentIdentifierMigration(mongoTemplate)
                .run(new DefaultApplicationArguments(new String[0]));

        ArgumentCaptor<Update> update = ArgumentCaptor.forClass(Update.class);
        verify(mongoTemplate)
                .updateFirst(any(Query.class), update.capture(), eq("vault_agent_chat_messages"));
        Document values = (Document) update.getValue().getUpdateObject().get("$set");
        assertThat(values.getString("clientIdentifier")).isEqualTo(hashedIdentifier);
        assertThat(values.getString("scopeKey"))
                .isEqualTo("guest:%s:session-id".formatted(hashedIdentifier));
        assertThat(values.toJson()).doesNotContain(rawIdentifier);
    }

    @Test
    void 로그인_대화는_보조_식별자만_치환하고_사용자_scopeKey를_유지한다() {
        MongoTemplate mongoTemplate = mock(MongoTemplate.class);
        String rawIdentifier = "203.0.113.20|browser";
        Document message =
                new Document("_id", "message-id")
                        .append("clientIdentifier", rawIdentifier)
                        .append("sessionId", "session-id")
                        .append("scopeKey", "user:user-id:session-id");
        when(mongoTemplate.find(
                        any(Query.class), eq(Document.class), eq("vault_agent_chat_messages")))
                .thenReturn(List.of(message));

        new AnonymousAgentIdentifierMigration(mongoTemplate)
                .run(new DefaultApplicationArguments(new String[0]));

        ArgumentCaptor<Update> update = ArgumentCaptor.forClass(Update.class);
        verify(mongoTemplate, times(1))
                .updateFirst(any(Query.class), update.capture(), eq("vault_agent_chat_messages"));
        Document values = (Document) update.getValue().getUpdateObject().get("$set");
        assertThat(values.getString("clientIdentifier"))
                .isEqualTo(OneWayIdentifierHasher.hash(rawIdentifier));
        assertThat(values).doesNotContainKey("scopeKey");
    }
}
