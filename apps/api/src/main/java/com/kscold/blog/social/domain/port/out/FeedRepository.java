package com.kscold.blog.social.domain.port.out;

import com.kscold.blog.social.domain.model.Feed;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface FeedRepository {
    Optional<Feed> findById(String id);
    Feed save(Feed feed);
    void delete(Feed feed);
    Page<Feed> findByVisibility(Feed.Visibility visibility, Pageable pageable);
    Page<Feed> findAll(Pageable pageable);
    void incrementCommentCount(String feedId);
    void decrementCommentCount(String feedId);
}
