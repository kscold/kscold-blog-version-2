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
import com.mongodb.client.result.UpdateResult;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.UpdateDefinition;

class PostRepositoryAdapterTest {

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
}
