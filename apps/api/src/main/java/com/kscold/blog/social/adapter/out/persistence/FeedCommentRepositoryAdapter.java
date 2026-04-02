package com.kscold.blog.social.adapter.out.persistence;

import com.kscold.blog.social.domain.model.FeedComment;
import com.kscold.blog.social.domain.port.out.FeedCommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@SuppressWarnings("null")
@Component
@RequiredArgsConstructor
public class FeedCommentRepositoryAdapter implements FeedCommentRepository {

    private final MongoFeedCommentRepository mongoFeedCommentRepository;

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
    public List<FeedComment> findAnonymousByFeedIdAndAuthorNames(String feedId, List<String> authorNames) {
        return mongoFeedCommentRepository.findByFeedIdAndUserIdIsNullAndAuthorNameIn(feedId, authorNames);
    }

    @Override
    public void deleteAllByFeedId(String feedId) {
        mongoFeedCommentRepository.deleteAllByFeedId(feedId);
    }

    @Override
    public void delete(FeedComment comment) {
        mongoFeedCommentRepository.delete(comment);
    }
}
