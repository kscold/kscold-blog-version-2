package com.kscold.blog.social.domain.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;

class FeedCommentIndexTest {

    @Test
    void declaresIndexesForPagingAndMentionCandidates() {
        CompoundIndexes indexes = FeedComment.class.getAnnotation(CompoundIndexes.class);

        assertThat(indexes).isNotNull();
        Map<String, String> definitions =
                Arrays.stream(indexes.value())
                        .collect(Collectors.toMap(CompoundIndex::name, CompoundIndex::def));
        assertThat(definitions)
                .containsEntry("idx_feed_createdAt", "{'feedId': 1, 'createdAt': 1}")
                .containsEntry("idx_feed_userId", "{'feedId': 1, 'userId': 1}");
    }
}
