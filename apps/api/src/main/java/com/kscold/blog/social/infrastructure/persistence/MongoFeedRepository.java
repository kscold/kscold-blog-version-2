package com.kscold.blog.social.infrastructure.persistence;

import com.kscold.blog.social.domain.model.Feed;
import com.kscold.blog.social.domain.port.out.FeedRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class MongoFeedRepository implements FeedRepository {

    private final SpringDataFeedRepository delegate;
    private final MongoTemplate mongoTemplate;

    @Override
    public Optional<Feed> findById(String id) {
        return delegate.findById(id);
    }

    @Override
    public Feed save(Feed feed) {
        return delegate.save(feed);
    }

    @Override
    public void delete(Feed feed) {
        delegate.delete(feed);
    }

    @Override
    public Page<Feed> findByVisibility(Feed.Visibility visibility, Pageable pageable) {
        return delegate.findByVisibility(visibility, pageable);
    }

    @Override
    public Page<Feed> findAll(Pageable pageable) {
        return delegate.findAll(pageable);
    }

    @Override
    public void incrementCommentCount(String feedId) {
        mongoTemplate.updateFirst(
                Query.query(Criteria.where("_id").is(feedId)),
                new Update().inc("commentsCount", 1),
                Feed.class
        );
    }

    @Override
    public void decrementCommentCount(String feedId) {
        mongoTemplate.updateFirst(
                Query.query(Criteria.where("_id").is(feedId).and("commentsCount").gt(0)),
                new Update().inc("commentsCount", -1),
                Feed.class
        );
    }
}

interface SpringDataFeedRepository extends MongoRepository<Feed, String> {
    Page<Feed> findByVisibility(Feed.Visibility visibility, Pageable pageable);
}
