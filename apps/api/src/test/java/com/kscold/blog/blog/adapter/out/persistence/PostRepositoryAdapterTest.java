package com.kscold.blog.blog.adapter.out.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.blog.domain.model.Post;
import com.kscold.blog.blog.domain.port.out.PostRepository.PublishedTagCounts;
import com.mongodb.client.result.UpdateResult;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.UpdateDefinition;

class PostRepositoryAdapterTest {

    @Test
    void countsPublishedAndPublicPostsByTagInOneMinimalAggregation() {
        MongoTemplate mongoTemplate = mock(MongoTemplate.class);
        String currentCategoryId = "507f191e810c19729de860ea";
        String legacyCategoryId = "legacy-category";
        Document row =
                new Document("_id", "AI").append("postCount", 4L).append("publicPostCount", 3L);
        Document missingTag =
                new Document("_id", null).append("postCount", 1L).append("publicPostCount", 1L);
        when(mongoTemplate.aggregate(any(Aggregation.class), eq("posts"), eq(Document.class)))
                .thenReturn(new AggregationResults<>(List.of(row, missingTag), new Document()));
        PostRepositoryAdapter adapter =
                new PostRepositoryAdapter(mock(MongoPostRepository.class), mongoTemplate);

        Map<String, PublishedTagCounts> result =
                adapter.countPublishedTagCounts(Set.of(currentCategoryId, legacyCategoryId));

        assertThat(result).isEqualTo(Map.of("AI", new PublishedTagCounts(4L, 3L)));
        ArgumentCaptor<Aggregation> aggregation = ArgumentCaptor.forClass(Aggregation.class);
        verify(mongoTemplate).aggregate(aggregation.capture(), eq("posts"), eq(Document.class));
        List<Document> pipeline = aggregation.getValue().toPipeline(Aggregation.DEFAULT_CONTEXT);
        assertThat(pipeline)
                .extracting(document -> document.keySet().iterator().next())
                .containsExactly("$match", "$project", "$unwind", "$group");
        assertThat(pipeline.get(0).toJson()).contains("status", "PUBLISHED");
        assertThat(pipeline.get(1).toJson())
                .contains("publicOverride", "category._id", currentCategoryId, legacyCategoryId)
                .doesNotContain("content", "excerpt", "coverImage");
        Document projection = pipeline.get(1).get("$project", Document.class);
        Document increment = projection.get("publicIncrement", Document.class);
        Document publicCondition = (Document) increment.getList("$cond", Object.class).get(0);
        List<Document> publicChecks = publicCondition.getList("$or", Document.class);
        List<?> categoryCheck = publicChecks.get(1).getList("$in", Object.class);
        @SuppressWarnings("unchecked")
        List<Object> categoryIds = (List<Object>) categoryCheck.get(1);
        assertThat(categoryIds)
                .contains(currentCategoryId, new ObjectId(currentCategoryId), legacyCategoryId);
        assertThat(pipeline.get(3).toJson()).contains("postCount", "publicPostCount");
    }

    @Test
    void replaceTagReferenceBuildsSerializableDeduplicatingUpdates() {
        MongoTemplate mongoTemplate = mock(MongoTemplate.class);
        when(mongoTemplate.updateMulti(
                        any(Query.class), any(UpdateDefinition.class), eq(Post.class)))
                .thenReturn(UpdateResult.acknowledged(1L, 1L, null));
        PostRepositoryAdapter adapter =
                new PostRepositoryAdapter(mock(MongoPostRepository.class), mongoTemplate);

        long modified =
                adapter.replaceTagReference(
                        "507f1f77bcf86cd799439011",
                        Post.TagInfo.builder()
                                .id("507f191e810c19729de860ea")
                                .name("target")
                                .slug("target-slug")
                                .build());

        ArgumentCaptor<Query> queries = ArgumentCaptor.forClass(Query.class);
        ArgumentCaptor<UpdateDefinition> updates = ArgumentCaptor.forClass(UpdateDefinition.class);
        verify(mongoTemplate, times(2))
                .updateMulti(queries.capture(), updates.capture(), eq(Post.class));
        assertThatCode(() -> queries.getAllValues().forEach(Query::getQueryObject))
                .doesNotThrowAnyException();
        assertThat(updates.getAllValues().get(0).getUpdateObject()).containsKey("$set");
        assertThat(updates.getAllValues().get(0).getUpdateObject().toJson())
                .contains("tags.$[target].slug", "target-slug");
        assertThat(updates.getAllValues().get(1).getUpdateObject()).containsKey("$pull");
        assertThat(modified).isEqualTo(2L);
    }

    @Test
    void updateTagReferenceUpdatesEmbeddedNameAndSlug() {
        MongoTemplate mongoTemplate = mock(MongoTemplate.class);
        when(mongoTemplate.updateMulti(
                        any(Query.class), any(UpdateDefinition.class), eq(Post.class)))
                .thenReturn(UpdateResult.acknowledged(1L, 1L, null));
        PostRepositoryAdapter adapter =
                new PostRepositoryAdapter(mock(MongoPostRepository.class), mongoTemplate);

        long modified =
                adapter.updateTagReference(
                        Post.TagInfo.builder()
                                .id("507f191e810c19729de860ea")
                                .name("renamed")
                                .slug("renamed-slug")
                                .build());

        ArgumentCaptor<UpdateDefinition> update = ArgumentCaptor.forClass(UpdateDefinition.class);
        verify(mongoTemplate).updateMulti(any(Query.class), update.capture(), eq(Post.class));
        assertThat(update.getValue().getUpdateObject().toJson())
                .contains("tags.$[target].name", "renamed", "tags.$[target].slug", "renamed-slug");
        assertThat(modified).isEqualTo(1L);
    }

    @Test
    void updateCategoryReferenceUpdatesEmbeddedNameAndSlug() {
        MongoTemplate mongoTemplate = mock(MongoTemplate.class);
        when(mongoTemplate.updateMulti(
                        any(Query.class), any(UpdateDefinition.class), eq(Post.class)))
                .thenReturn(UpdateResult.acknowledged(1L, 1L, null));
        PostRepositoryAdapter adapter =
                new PostRepositoryAdapter(mock(MongoPostRepository.class), mongoTemplate);

        long modified =
                adapter.updateCategoryReference(
                        Post.CategoryInfo.builder()
                                .id("507f191e810c19729de860ea")
                                .name("renamed")
                                .slug("renamed-slug")
                                .build());

        ArgumentCaptor<UpdateDefinition> update = ArgumentCaptor.forClass(UpdateDefinition.class);
        verify(mongoTemplate).updateMulti(any(Query.class), update.capture(), eq(Post.class));
        assertThat(update.getValue().getUpdateObject().toJson())
                .contains("category.name", "renamed", "category.slug", "renamed-slug");
        assertThat(modified).isEqualTo(1L);
    }
}
