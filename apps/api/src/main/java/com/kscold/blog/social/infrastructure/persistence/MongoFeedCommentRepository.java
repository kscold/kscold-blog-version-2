package com.kscold.blog.social.infrastructure.persistence;

import com.kscold.blog.social.domain.model.FeedComment;
import com.kscold.blog.social.domain.port.out.FeedCommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class MongoFeedCommentRepository implements FeedCommentRepository {

    private final SpringDataFeedCommentRepository delegate;

    @Override
    public Optional<FeedComment> findById(String id) {
        return delegate.findById(id);
    }

    @Override
    public FeedComment save(FeedComment comment) {
        return delegate.save(comment);
    }

    @Override
    public void delete(FeedComment comment) {
        delegate.delete(comment);
    }

    @Override
    public Page<FeedComment> findByFeedId(String feedId, Pageable pageable) {
        return delegate.findByFeedId(feedId, pageable);
    }

    @Override
    public void deleteAllByFeedId(String feedId) {
        delegate.deleteAllByFeedId(feedId);
    }
}

interface SpringDataFeedCommentRepository extends MongoRepository<FeedComment, String> {
    Page<FeedComment> findByFeedId(String feedId, Pageable pageable);
    void deleteAllByFeedId(String feedId);
}
