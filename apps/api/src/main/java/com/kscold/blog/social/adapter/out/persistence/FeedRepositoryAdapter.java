package com.kscold.blog.social.adapter.out.persistence;

import com.kscold.blog.social.domain.model.Feed;
import com.kscold.blog.social.domain.port.out.FeedRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

import java.util.Optional;

@SuppressWarnings("null")
@Component
@RequiredArgsConstructor
public class FeedRepositoryAdapter implements FeedRepository {

    private final MongoFeedRepository mongoFeedRepository;
    private final MongoTemplate mongoTemplate;

    @Override
    public Feed save(Feed feed) {
        return mongoFeedRepository.save(feed);
    }

    @Override
    public Optional<Feed> findById(String id) {
        return mongoFeedRepository.findById(id);
    }

    @Override
    public Page<Feed> findByVisibility(Feed.Visibility visibility, Pageable pageable) {
        return mongoFeedRepository.findByVisibility(visibility, pageable);
    }

    @Override
    public Page<Feed> findAll(Pageable pageable) {
        return mongoFeedRepository.findAll(pageable);
    }

    @Override
    public void delete(Feed feed) {
        mongoFeedRepository.delete(feed);
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
