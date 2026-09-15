package com.kscold.blog.blog.adapter.out.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import com.kscold.blog.blog.domain.model.Category;
import com.kscold.blog.blog.domain.model.Post;
import java.time.LocalDateTime;
import java.util.List;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;
import org.springframework.data.mongodb.core.convert.NoOpDbRefResolver;
import org.springframework.data.mongodb.core.convert.QueryMapper;
import org.springframework.data.mongodb.core.mapping.MongoMappingContext;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

@ExtendWith(MockitoExtension.class)
class PostNavigationRepositoryAdapterTest {
    @Mock private MongoTemplate mongoTemplate;
    @InjectMocks private PostNavigationRepositoryAdapter repository;

    @Test
    void queriesOnlyPublicPublishedNeighborsWithoutBodies() {
        when(mongoTemplate.find(any(Query.class), eq(Category.class)))
                .thenReturn(List.of(Category.builder().id("public-category").build()));
        Post current = post("current", "현재 글");
        when(mongoTemplate.findOne(any(Query.class), eq(Post.class)))
                .thenReturn(current, post("older", "이전 글"), post("newer", "다음 글"));

        var result = repository.findBySlug("current").orElseThrow();

        assertThat(result.previous().slug()).isEqualTo("older");
        assertThat(result.next().slug()).isEqualTo("newer");
        ArgumentCaptor<Query> captor = ArgumentCaptor.forClass(Query.class);
        verify(mongoTemplate, times(3)).findOne(captor.capture(), eq(Post.class));
        for (Query query : captor.getAllValues()) {
            assertThat(query.getQueryObject().toString())
                    .contains("PUBLISHED", "publicOverride", "public-category");
            assertThat(query.getFieldsObject())
                    .containsKeys("title", "slug", "publishedAt")
                    .doesNotContainKeys("content", "tags");
        }
        assertThat(captor.getAllValues().get(1).getLimit()).isEqualTo(1);
        assertThat(captor.getAllValues().get(1).getSortObject()).containsEntry("id", -1);
        assertThat(captor.getAllValues().get(2).getSortObject()).containsEntry("id", 1);
    }

    @Test
    void missingOrPrivateSourceDoesNotQueryNeighbors() {
        when(mongoTemplate.find(any(Query.class), eq(Category.class))).thenReturn(List.of());
        assertThat(repository.findBySlug("hidden")).isEmpty();
        verify(mongoTemplate).findOne(any(Query.class), eq(Post.class));
    }

    @Test
    void firstOrLastPostAllowsMissingNeighbor() {
        when(mongoTemplate.find(any(Query.class), eq(Category.class))).thenReturn(List.of());
        when(mongoTemplate.findOne(any(Query.class), eq(Post.class)))
                .thenReturn(post("only", "유일한 글"), null, null);
        var result = repository.findBySlug("only").orElseThrow();
        assertThat(result.previous()).isNull();
        assertThat(result.next()).isNull();
    }

    @Test
    void sameTimestampUsesStrictIdentifierComparison() {
        assertThat(
                        PostNavigationRepositoryAdapter.position(post("current", "현재 글"), true)
                                .getCriteriaObject()
                                .toString())
                .contains("$gt=current", "publishedAt");
        assertThat(
                        PostNavigationRepositoryAdapter.position(post("current", "현재 글"), false)
                                .getCriteriaObject()
                                .toString())
                .contains("$lt=current", "publishedAt");
    }

    private Post post(String id, String title) {
        return Post.builder()
                .id(id)
                .slug(id)
                .title(title)
                .publishedAt(LocalDateTime.of(2026, 9, 15, 12, 0))
                .category(Post.CategoryInfo.builder().slug("engineering").build())
                .build();
    }

    @Test
    void nestedCategoryAndPostIdentifiersMapToBsonObjectIds() {
        MongoMappingContext context = new MongoMappingContext();
        MappingMongoConverter converter =
                new MappingMongoConverter(NoOpDbRefResolver.INSTANCE, context);
        converter.afterPropertiesSet();
        context.setSimpleTypeHolder(converter.getCustomConversions().getSimpleTypeHolder());
        QueryMapper mapper = new QueryMapper(converter);
        String id = "6aa216c7c112f37bb959166a";
        Document mapped =
                mapper.getMappedObject(
                        Criteria.where("category.id")
                                .in(List.of(id))
                                .and("id")
                                .gt(id)
                                .getCriteriaObject(),
                        context.getPersistentEntity(Post.class));
        assertThat(mapped.get("category._id", Document.class).getList("$in", ObjectId.class))
                .containsExactly(new ObjectId(id));
        assertThat(mapped.get("_id", Document.class).get("$gt")).isEqualTo(new ObjectId(id));
    }
}
