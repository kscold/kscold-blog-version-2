package com.kscold.blog.blog.adapter.out.persistence;

import com.kscold.blog.blog.domain.model.Category;
import com.kscold.blog.blog.domain.model.Post;
import com.kscold.blog.blog.domain.model.PostNavigation;
import com.kscold.blog.blog.domain.port.out.PostNavigationRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PostNavigationRepositoryAdapter implements PostNavigationRepository {
    private final MongoTemplate mongoTemplate;

    @Override
    public Optional<PostNavigation> findBySlug(String slug) {
        Query categories = Query.query(Criteria.where("restricted").ne(true));
        categories.fields().include("id");
        List<String> publicIds =
                mongoTemplate.find(categories, Category.class).stream()
                        .map(Category::getId)
                        .toList();
        Post current =
                mongoTemplate.findOne(
                        project(
                                new Criteria()
                                        .andOperator(
                                                publicPosts(publicIds),
                                                Criteria.where("slug").is(slug))),
                        Post.class);
        if (current == null) return Optional.empty();
        if (current.getPublishedAt() == null) return Optional.of(new PostNavigation(null, null));
        return Optional.of(
                new PostNavigation(
                        adjacent(current, publicIds, false), adjacent(current, publicIds, true)));
    }

    private PostNavigation.Entry adjacent(Post current, List<String> publicIds, boolean newer) {
        Query query =
                project(
                        new Criteria()
                                .andOperator(publicPosts(publicIds), position(current, newer)));
        query.with(Sort.by(newer ? Sort.Direction.ASC : Sort.Direction.DESC, "publishedAt", "id"));
        query.limit(1);
        Post result = mongoTemplate.findOne(query, Post.class);
        return result == null
                ? null
                : new PostNavigation.Entry(
                        result.getTitle(), result.getSlug(), result.getCategory().getSlug());
    }

    /** 발행 시각이 같아도 목록과 같은 식별자 순서로 연결해 누락과 순환을 막는다. */
    static Criteria position(Post current, boolean newer) {
        Criteria date = Criteria.where("publishedAt");
        Criteria id = Criteria.where("id");
        return new Criteria()
                .orOperator(
                        newer
                                ? date.gt(current.getPublishedAt())
                                : date.lt(current.getPublishedAt()),
                        new Criteria()
                                .andOperator(
                                        Criteria.where("publishedAt").is(current.getPublishedAt()),
                                        newer ? id.gt(current.getId()) : id.lt(current.getId())));
    }

    private Criteria publicPosts(List<String> publicIds) {
        return new Criteria()
                .andOperator(
                        Criteria.where("status").is(Post.Status.PUBLISHED),
                        Criteria.where("category.slug").exists(true).nin("", null),
                        Criteria.where("slug").exists(true).nin("", null),
                        new Criteria()
                                .orOperator(
                                        Criteria.where("publicOverride").is(true),
                                        Criteria.where("category.id").in(publicIds)));
    }

    /** 이웃 탐색은 본문이나 태그를 읽지 않고 표시와 정렬에 필요한 필드만 조회한다. */
    private Query project(Criteria criteria) {
        Query query = Query.query(criteria);
        query.fields().include("id", "title", "slug", "category.slug", "publishedAt");
        return query;
    }
}
