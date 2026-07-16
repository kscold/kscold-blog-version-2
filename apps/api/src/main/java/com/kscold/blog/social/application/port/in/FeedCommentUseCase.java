package com.kscold.blog.social.application.port.in;

import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.social.application.dto.command.FeedCommentCreateCommand;
import com.kscold.blog.social.domain.model.FeedComment;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface FeedCommentUseCase {

    FeedComment create(String feedId, FeedCommentCreateCommand command, String userId);

    Page<FeedComment> getByFeedId(String feedId, Pageable pageable, String currentUserId);

    void delete(String feedId, String commentId, String currentUserId);

    /** 이 피드에서 @언급할 수 있는 사용자 목록(주인 + 댓글 참여자). */
    List<User> getMentionableUsers(String feedId);
}
