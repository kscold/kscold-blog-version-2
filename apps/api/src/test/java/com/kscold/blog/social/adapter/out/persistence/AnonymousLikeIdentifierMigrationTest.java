package com.kscold.blog.social.adapter.out.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.shared.security.OneWayIdentifierHasher;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.bson.Document;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

class AnonymousLikeIdentifierMigrationTest {

    @Test
    void 원본_익명_식별자를_해시하고_중복을_제거해_좋아요_수를_맞춘다() {
        MongoTemplate mongoTemplate = mock(MongoTemplate.class);
        String rawIdentifier = "203.0.113.10|browser";
        String hashedIdentifier = OneWayIdentifierHasher.hash(rawIdentifier);
        Document feed =
                new Document("_id", "feed-id")
                        .append(
                                "likedBy",
                                List.of(rawIdentifier, hashedIdentifier, "authenticated-user-id"));
        when(mongoTemplate.find(any(Query.class), eq(Document.class), eq("feeds")))
                .thenReturn(List.of(feed));
        when(mongoTemplate.find(any(Query.class), eq(Document.class), eq("feed_comments")))
                .thenReturn(List.of());

        new AnonymousLikeIdentifierMigration(mongoTemplate)
                .run(new DefaultApplicationArguments(new String[0]));

        ArgumentCaptor<Update> update = ArgumentCaptor.forClass(Update.class);
        verify(mongoTemplate).updateFirst(any(Query.class), update.capture(), eq("feeds"));
        Document values = (Document) update.getValue().getUpdateObject().get("$set");
        Set<String> storedIdentifiers =
                ((Collection<?>) values.get("likedBy"))
                        .stream().map(String::valueOf).collect(Collectors.toSet());
        assertThat(storedIdentifiers)
                .containsExactlyInAnyOrder(hashedIdentifier, "authenticated-user-id");
        assertThat(values.get("likesCount")).isEqualTo(2);
        assertThat(values.toJson()).doesNotContain(rawIdentifier);
    }
}
