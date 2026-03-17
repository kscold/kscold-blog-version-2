package com.kscold.blog.social.application.port.in;

import com.kscold.blog.social.application.dto.FeedCreateCommand;
import com.kscold.blog.social.application.dto.FeedUpdateCommand;
import com.kscold.blog.social.domain.model.Feed;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface FeedUseCase {

    Feed create(FeedCreateCommand command, String userId);

    Feed update(String id, FeedUpdateCommand command);

    void delete(String id);

    Feed getById(String id);

    Page<Feed> getPublicFeeds(Pageable pageable);

    Page<Feed> getAllFeeds(Pageable pageable);

    Feed toggleLike(String feedId, String identifier);

    void incrementCommentCount(String feedId);

    void decrementCommentCount(String feedId);

    void validateOwnership(String feedId, String userId);
}
