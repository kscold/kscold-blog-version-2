package com.kscold.blog.social.adapter.out.persistence;

import com.kscold.blog.social.domain.model.FeedComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MongoFeedCommentRepository extends MongoRepository<FeedComment, String> {

    Page<FeedComment> findByFeedId(String feedId, Pageable pageable);

    void deleteAllByFeedId(String feedId);
}
