package com.kscold.blog.blog.adapter.out.persistence;

import com.kscold.blog.blog.domain.model.Post;
import com.kscold.blog.blog.domain.port.out.PostRepository;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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

    /** 태그를 합칠 때 글에 박힌 {_id, name} 참조를 통째로 바꾼다. */
    @Override
    public long replaceTagReference(String fromTagId, String toTagId, String toName) {
        Query query = Query.query(Criteria.where("tags._id").is(new ObjectId(fromTagId)));
        Update update =
                new Update()
                        .set("tags.$[target]._id", new ObjectId(toTagId))
                        .set("tags.$[target].name", toName)
                        .filterArray(Criteria.where("target._id").is(new ObjectId(fromTagId)));
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
}
