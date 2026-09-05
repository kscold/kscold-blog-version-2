package com.kscold.blog.social.adapter.out.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.social.domain.model.FeedComment;
import java.util.List;
import org.bson.Document;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;

class FeedCommentRepositoryAdapterTest {

    @Test
    void findsOnlyDistinctAuthenticatedCommenterIds() {
        MongoFeedCommentRepository repository = mock(MongoFeedCommentRepository.class);
        MongoTemplate mongoTemplate = mock(MongoTemplate.class);
        when(mongoTemplate.findDistinct(
                        any(Query.class), eq("userId"), eq(FeedComment.class), eq(String.class)))
                .thenReturn(List.of("user-1", "user-2"));

        List<String> result =
                new FeedCommentRepositoryAdapter(repository, mongoTemplate)
                        .findDistinctUserIdsByFeedId("feed-1");

        assertThat(result).containsExactly("user-1", "user-2");
        ArgumentCaptor<Query> query = ArgumentCaptor.forClass(Query.class);
        verify(mongoTemplate)
                .findDistinct(
                        query.capture(), eq("userId"), eq(FeedComment.class), eq(String.class));
        Document criteria = query.getValue().getQueryObject();
        assertThat(criteria.getString("feedId")).isEqualTo("feed-1");
        assertThat(criteria.get("userId")).isInstanceOf(Document.class);
        assertThat(((Document) criteria.get("userId"))).containsKey("$ne");
    }
}
