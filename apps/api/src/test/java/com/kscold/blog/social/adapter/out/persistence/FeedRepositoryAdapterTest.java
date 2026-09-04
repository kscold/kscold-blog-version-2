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
import com.mongodb.client.result.UpdateResult;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.UpdateDefinition;

class FeedRepositoryAdapterTest {

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
