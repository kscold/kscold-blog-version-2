package com.kscold.blog.social.domain.port.out;

import com.kscold.blog.social.domain.model.FeedComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface FeedCommentRepository {
    Optional<FeedComment> findById(String id);
    FeedComment save(FeedComment comment);
    void delete(FeedComment comment);
    Page<FeedComment> findByFeedId(String feedId, Pageable pageable);
    void deleteAllByFeedId(String feedId);
}
