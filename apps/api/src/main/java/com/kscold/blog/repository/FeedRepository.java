package com.kscold.blog.repository;

import com.kscold.blog.model.Feed;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedRepository extends MongoRepository<Feed, String> {
    Page<Feed> findByVisibility(Feed.Visibility visibility, Pageable pageable);

    Page<Feed> findByAuthorId(String authorId, Pageable pageable);

    long countByVisibility(Feed.Visibility visibility);
}
