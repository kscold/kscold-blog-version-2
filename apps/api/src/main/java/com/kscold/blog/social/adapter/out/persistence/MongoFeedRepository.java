package com.kscold.blog.social.adapter.out.persistence;

import com.kscold.blog.social.domain.model.Feed;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MongoFeedRepository extends MongoRepository<Feed, String> {

    Page<Feed> findByVisibility(Feed.Visibility visibility, Pageable pageable);
}
