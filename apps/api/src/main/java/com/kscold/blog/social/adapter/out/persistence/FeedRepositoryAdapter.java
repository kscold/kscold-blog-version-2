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

    /**
     * 좋아요 토글 — 두 번의 atomic update로 race-free.
     *   1) $addToSet + $inc(+1) : likedBy에 identifier가 없을 때만 추가, 같이 count 증가
     *   2) 실패하면 이미 좋아요 상태 → $pull + $inc(-1)
     * @return 추가됐으면 true, 취소됐으면 false
     */
    @Override
    public boolean toggleLike(String feedId, String identifier) {
        Query notLikedYet = Query.query(
                Criteria.where("_id").is(feedId).and("likedBy").ne(identifier));
        Update addLike = new Update().addToSet("likedBy", identifier).inc("likesCount", 1);
        long added = mongoTemplate.updateFirst(notLikedYet, addLike, Feed.class).getModifiedCount();
        if (added > 0) return true;

        Query alreadyLiked = Query.query(
                Criteria.where("_id").is(feedId).and("likedBy").is(identifier));
        Update removeLike = new Update().pull("likedBy", identifier).inc("likesCount", -1);
        mongoTemplate.updateFirst(alreadyLiked, removeLike, Feed.class);
        return false;
    }
}
