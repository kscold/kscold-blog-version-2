package com.kscold.blog.social.application.port.in;

import com.kscold.blog.social.application.dto.command.FeedCreateCommand;
import com.kscold.blog.social.application.dto.command.FeedUpdateCommand;
import com.kscold.blog.social.application.dto.response.FeedSitemapResponse;
import com.kscold.blog.social.domain.model.Feed;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface FeedUseCase {

    Feed create(FeedCreateCommand command, String userId);

    Feed update(String id, FeedUpdateCommand command);

    void delete(String id);

    Feed getById(String id);

    Page<Feed> getPublicFeeds(Pageable pageable);

    Page<Feed> getPublicFeedsByTag(String tag, Pageable pageable);

    Page<Feed> getPublicFeedsByAuthorId(String authorId, Pageable pageable);

    Page<Feed> getAllFeeds(Pageable pageable);

    List<FeedSitemapResponse> getSitemapIndex();

    Feed toggleLike(String feedId, String identifier);

    void incrementCommentCount(String feedId);

    void decrementCommentCount(String feedId);

    void validateOwnership(String feedId, String userId, boolean isAdmin);

    List<Map<String, Object>> getFeedTags();

    /** 태그 이름 → 공개 피드 사용 횟수. 태그 인덱스를 만들 때 쓴다. */
    Map<String, Long> getFeedTagCounts();

    /** 피드의 태그 이름을 일괄 변경한다. 태그를 합칠 때 쓴다. */
    long renameFeedTag(String fromName, String toName);
}
