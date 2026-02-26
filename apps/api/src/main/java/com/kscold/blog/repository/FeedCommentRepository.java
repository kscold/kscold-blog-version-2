package com.kscold.blog.repository;

import com.kscold.blog.model.FeedComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedCommentRepository extends MongoRepository<FeedComment, String> {
    Page<FeedComment> findByFeedId(String feedId, Pageable pageable);

    long countByFeedId(String feedId);

    void deleteAllByFeedId(String feedId);
}
