package com.kscold.blog.social.adapter.out.persistence;

import com.kscold.blog.social.domain.model.Feed;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface MongoFeedRepository extends MongoRepository<Feed, String> {

    Page<Feed> findByVisibility(Feed.Visibility visibility, Pageable pageable);

    Page<Feed> findByVisibilityAndTagsContaining(
            Feed.Visibility visibility, String tag, Pageable pageable);

    @Query("{ 'author.id': ?0, 'visibility': ?1 }")
    Page<Feed> findByAuthorIdAndVisibility(
            String authorId, Feed.Visibility visibility, Pageable pageable);
}
