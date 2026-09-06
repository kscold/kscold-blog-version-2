package com.kscold.blog.blog.adapter.out.persistence;

import com.kscold.blog.blog.domain.model.Post;
import com.kscold.blog.blog.domain.port.out.PostRepository;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

/** PostRepository 포트의 영속성 어댑터 Spring Data MongoDB를 사용하여 포트 인터페이스를 구현 */
@SuppressWarnings("null")
@Component
@RequiredArgsConstructor
public class PostRepositoryAdapter implements PostRepository {

    private final MongoPostRepository mongoPostRepository;
    private final MongoTemplate mongoTemplate;

    @Override
    public Post save(Post post) {
        return mongoPostRepository.save(post);
    }

    @Override
    public Optional<Post> findById(String id) {
        return mongoPostRepository.findById(id);
    }

    @Override
    public Optional<Post> findBySlug(String slug) {
        return mongoPostRepository.findBySlug(slug);
    }

    @Override
    public Page<Post> findByStatus(Post.Status status, Pageable pageable) {
        return mongoPostRepository.findByStatus(status, pageable);
    }

    @Override
    public Page<Post> findByCategoryIdAndPublished(String categoryId, Pageable pageable) {
        return mongoPostRepository.findByCategoryIdAndPublished(categoryId, pageable);
    }

    @Override
    public Page<Post> findByTagIdAndPublished(String tagId, Pageable pageable) {
        return mongoPostRepository.findByTagIdAndPublished(tagId, pageable);
    }

    @Override
    public List<Post> findFeaturedPosts(Pageable pageable) {
        return mongoPostRepository.findFeaturedPosts(pageable);
    }

    @Override
    public List<Post> findHotPosts(LocalDateTime since, Pageable pageable) {
        return mongoPostRepository.findByStatusAndPublishedAtAfter(
                Post.Status.PUBLISHED, since, pageable);
    }

    @Override
    public List<Post> findAllPublished(Pageable pageable) {
        return mongoPostRepository.findByStatus(Post.Status.PUBLISHED, pageable).getContent();
    }

    @Override
    public Page<Post> searchByText(String searchText, Pageable pageable) {
        return mongoPostRepository.searchByText(searchText, pageable);
    }

    @Override
    public Page<Post> findAll(Pageable pageable) {
        return mongoPostRepository.findAll(pageable);
    }

    @Override
    public boolean existsBySlug(String slug) {
        return mongoPostRepository.existsBySlug(slug);
    }

    @Override
    public long countByStatus(Post.Status status) {
        return mongoPostRepository.countByStatus(status);
    }

    /** 태그 이름별로 발행된 글 수를 한 번에 센다. 태그 수만큼 질의하지 않기 위해 집계를 쓴다. */
    @Override
    public Map<String, Long> countPublishedByTagName() {
        Aggregation aggregation =
                Aggregation.newAggregation(
                        Aggregation.match(
                                Criteria.where("status").is(Post.Status.PUBLISHED.name())),
                        Aggregation.unwind("tags"),
                        Aggregation.group("tags.name").count().as("count"));
        return toCountMap(mongoTemplate.aggregate(aggregation, "posts", Document.class));
    }

    /** 공개 정책까지 반영한 태그별 발행 글 수를 한 번의 집계로 센다. */
    @Override
    public Map<String, PublishedTagCounts> countPublishedTagCounts(Set<String> publicCategoryIds) {
        List<Object> mongoCategoryIds = toMongoIds(publicCategoryIds);
        Aggregation aggregation =
                Aggregation.newAggregation(
                        Aggregation.match(
                                Criteria.where("status").is(Post.Status.PUBLISHED.name())),
                        context -> publishedTagProjection(mongoCategoryIds),
                        Aggregation.unwind("tags"),
                        context -> publishedTagGrouping());
        AggregationResults<Document> results =
                mongoTemplate.aggregate(aggregation, "posts", Document.class);
        return toPublishedTagCounts(results);
    }

    /** 태그를 합칠 때 글에 박힌 {_id, name, slug} 참조를 통째로 바꾼다. */
    @Override
    public long replaceTagReference(String fromTagId, Post.TagInfo targetTag) {
        ObjectId sourceId = new ObjectId(fromTagId);
        ObjectId targetId = new ObjectId(targetTag.getId());
        Criteria renameCriteria =
                new Criteria()
                        .andOperator(
                                Criteria.where("tags._id").is(sourceId),
                                Criteria.where("tags._id").ne(targetId));
        Update renameUpdate =
                new Update()
                        .set("tags.$[target]._id", targetId)
                        .set("tags.$[target].name", targetTag.getName())
                        .set("tags.$[target].slug", targetTag.getSlug())
                        .filterArray(Criteria.where("target._id").is(sourceId));
        long renamed =
                mongoTemplate
                        .updateMulti(Query.query(renameCriteria), renameUpdate, Post.class)
                        .getModifiedCount();

        Query duplicateQuery = Query.query(Criteria.where("tags._id").all(sourceId, targetId));
        Update duplicateUpdate =
                new Update()
                        .pull(
                                "tags",
                                Query.query(Criteria.where("_id").is(sourceId)).getQueryObject());
        long deduplicated =
                mongoTemplate
                        .updateMulti(duplicateQuery, duplicateUpdate, Post.class)
                        .getModifiedCount();
        return renamed + deduplicated;
    }

    @Override
    public long updateTagReference(Post.TagInfo tag) {
        ObjectId tagId = new ObjectId(tag.getId());
        Query query = Query.query(Criteria.where("tags._id").is(tagId));
        Update update =
                new Update()
                        .set("tags.$[target].name", tag.getName())
                        .set("tags.$[target].slug", tag.getSlug())
                        .filterArray(Criteria.where("target._id").is(tagId));
        return mongoTemplate.updateMulti(query, update, Post.class).getModifiedCount();
    }

    @Override
    public long updateCategoryReference(Post.CategoryInfo category) {
        ObjectId categoryId = new ObjectId(category.getId());
        Query query = Query.query(Criteria.where("category._id").is(categoryId));
        Update update =
                new Update()
                        .set("category.name", category.getName())
                        .set("category.slug", category.getSlug());
        return mongoTemplate.updateMulti(query, update, Post.class).getModifiedCount();
    }

    /** 이 태그를 쓴 글들이 어느 카테고리에 얼마나 있는지 센다. */
    @Override
    public Map<String, Long> countCategoriesByTagId(String tagId) {
        Aggregation aggregation =
                Aggregation.newAggregation(
                        Aggregation.match(
                                Criteria.where("tags._id")
                                        .is(new ObjectId(tagId))
                                        .and("status")
                                        .is(Post.Status.PUBLISHED.name())),
                        Aggregation.group("category._id").count().as("count"));
        return toCountMap(mongoTemplate.aggregate(aggregation, "posts", Document.class));
    }

    private Map<String, Long> toCountMap(AggregationResults<Document> results) {
        Map<String, Long> counts = new HashMap<>();
        for (Document document : results.getMappedResults()) {
            Object key = document.get("_id");
            if (key == null) continue;
            counts.put(key.toString(), ((Number) document.get("count")).longValue());
        }
        return counts;
    }

    private Document publishedTagProjection(List<Object> publicCategoryIds) {
        Document publicPost =
                new Document(
                        "$or",
                        List.of(
                                new Document("$eq", List.of("$publicOverride", true)),
                                new Document("$in", List.of("$category._id", publicCategoryIds))));
        return new Document(
                "$project",
                new Document("tags.name", 1)
                        .append(
                                "publicIncrement",
                                new Document("$cond", List.of(publicPost, 1, 0))));
    }

    private Document publishedTagGrouping() {
        return new Document(
                "$group",
                new Document("_id", "$tags.name")
                        .append("postCount", new Document("$sum", 1))
                        .append("publicPostCount", new Document("$sum", "$publicIncrement")));
    }

    private Map<String, PublishedTagCounts> toPublishedTagCounts(
            AggregationResults<Document> results) {
        Map<String, PublishedTagCounts> counts = new HashMap<>();
        for (Document document : results.getMappedResults()) {
            Object key = document.get("_id");
            if (key == null) continue;
            counts.put(
                    key.toString(),
                    new PublishedTagCounts(
                            number(document, "postCount"), number(document, "publicPostCount")));
        }
        return counts;
    }

    private long number(Document document, String key) {
        Object value = document.get(key);
        return value instanceof Number number ? number.longValue() : 0L;
    }

    private List<Object> toMongoIds(Set<String> ids) {
        LinkedHashSet<Object> mongoIds = new LinkedHashSet<>();
        for (String id : ids) {
            if (id == null || id.isBlank()) continue;
            mongoIds.add(id);
            if (ObjectId.isValid(id)) mongoIds.add(new ObjectId(id));
        }
        return List.copyOf(mongoIds);
    }
}
