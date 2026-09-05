package com.kscold.blog.social.adapter.out.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.social.domain.model.Feed;
import com.kscold.blog.social.domain.port.out.FeedRepository;
import com.mongodb.client.result.UpdateResult;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.UpdateDefinition;

class FeedRepositoryAdapterTest {

    @Test
    void readsTheMinimalPublicFeedSitemapIndex() {
        MongoTemplate mongoTemplate = mock(MongoTemplate.class);
        ObjectId id = new ObjectId();
        Instant createdAt = Instant.parse("2026-09-01T00:00:00Z");
        Instant updatedAt = Instant.parse("2026-09-02T00:00:00Z");
        Document row =
                new Document("_id", id)
                        .append("contentLength", 120)
                        .append("createdAt", Date.from(createdAt))
                        .append("updatedAt", Date.from(updatedAt));
        when(mongoTemplate.aggregate(any(Aggregation.class), eq("feeds"), eq(Document.class)))
                .thenReturn(new AggregationResults<>(List.of(row), new Document()));
        FeedRepositoryAdapter adapter =
                new FeedRepositoryAdapter(mock(MongoFeedRepository.class), mongoTemplate);

        List<FeedRepository.SitemapFeed> result = adapter.findAllPublicForSitemap();

        assertThat(result)
                .containsExactly(
                        new FeedRepository.SitemapFeed(
                                id.toHexString(), 120, createdAt, updatedAt));
        ArgumentCaptor<Aggregation> aggregation = ArgumentCaptor.forClass(Aggregation.class);
        verify(mongoTemplate).aggregate(aggregation.capture(), eq("feeds"), eq(Document.class));
        assertThat(aggregation.getValue().toPipeline(Aggregation.DEFAULT_CONTEXT))
                .extracting(document -> document.keySet().iterator().next())
                .containsExactly("$match", "$project");
    }

    @Test
    void renameTagBuildsSerializableQueries() {
        MongoTemplate mongoTemplate = mock(MongoTemplate.class);
        when(mongoTemplate.updateMulti(
                        any(Query.class), any(UpdateDefinition.class), eq(Feed.class)))
                .thenReturn(UpdateResult.acknowledged(1L, 1L, null));
        FeedRepositoryAdapter adapter =
                new FeedRepositoryAdapter(mock(MongoFeedRepository.class), mongoTemplate);

        long modified = adapter.renameTag("source", "target");

        ArgumentCaptor<Query> queries = ArgumentCaptor.forClass(Query.class);
        verify(mongoTemplate, times(2))
                .updateMulti(queries.capture(), any(UpdateDefinition.class), eq(Feed.class));
        assertThatCode(() -> queries.getAllValues().forEach(Query::getQueryObject))
                .doesNotThrowAnyException();
        assertThat(modified).isEqualTo(2L);
    }
}
