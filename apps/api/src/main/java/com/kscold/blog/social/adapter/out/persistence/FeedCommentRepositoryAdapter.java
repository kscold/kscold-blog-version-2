package com.kscold.blog.social.adapter.out.persistence;

import com.kscold.blog.social.domain.model.FeedComment;
import com.kscold.blog.social.domain.port.out.FeedCommentRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

@SuppressWarnings("null")
@Component
@RequiredArgsConstructor
public class FeedCommentRepositoryAdapter implements FeedCommentRepository {

    private final MongoFeedCommentRepository mongoFeedCommentRepository;
    private final MongoTemplate mongoTemplate;

    @Override
    public FeedComment save(FeedComment comment) {
        return mongoFeedCommentRepository.save(comment);
    }

    @Override
    public List<FeedComment> saveAll(List<FeedComment> comments) {
        return mongoFeedCommentRepository.saveAll(comments);
    }

    @Override
    public Optional<FeedComment> findById(String id) {
        return mongoFeedCommentRepository.findById(id);
    }

    @Override
    public Page<FeedComment> findByFeedId(String feedId, Pageable pageable) {
        return mongoFeedCommentRepository.findByFeedId(feedId, pageable);
    }

    @Override
    public List<FeedComment> findAnonymousByFeedIdAndAuthorNames(
            String feedId, List<String> authorNames) {
        return mongoFeedCommentRepository.findByFeedIdAndUserIdIsNullAndAuthorNameIn(
                feedId, authorNames);
    }

    @Override
    public void deleteAllByFeedId(String feedId) {
        mongoFeedCommentRepository.deleteAllByFeedId(feedId);
    }

    @Override
    public void delete(FeedComment comment) {
        mongoFeedCommentRepository.delete(comment);
    }

    /** 피드 좋아요와 같은 방식. 조회 후 저장하면 동시 요청에서 수가 어긋나므로 조건부 갱신만 쓴다. */
    @Override
    public boolean toggleLike(String commentId, String identifier) {
        Query notLikedYet =
                Query.query(Criteria.where("_id").is(commentId).and("likedBy").ne(identifier));
        Update addLike = new Update().addToSet("likedBy", identifier).inc("likesCount", 1);
        long added =
                mongoTemplate
                        .updateFirst(notLikedYet, addLike, FeedComment.class)
                        .getModifiedCount();
        if (added > 0) return true;

        Query alreadyLiked =
                Query.query(Criteria.where("_id").is(commentId).and("likedBy").is(identifier));
        Update removeLike = new Update().pull("likedBy", identifier).inc("likesCount", -1);
        mongoTemplate.updateFirst(alreadyLiked, removeLike, FeedComment.class);
        return false;
    }
}
