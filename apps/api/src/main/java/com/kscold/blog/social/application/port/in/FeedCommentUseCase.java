package com.kscold.blog.social.application.port.in;

import com.kscold.blog.social.application.dto.FeedCommentCreateCommand;
import com.kscold.blog.social.domain.model.FeedComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface FeedCommentUseCase {

    FeedComment create(String feedId, FeedCommentCreateCommand command);

    Page<FeedComment> getByFeedId(String feedId, Pageable pageable);

    void delete(String feedId, String commentId, String password);
}
