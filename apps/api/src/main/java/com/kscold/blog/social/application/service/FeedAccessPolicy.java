package com.kscold.blog.social.application.service;

import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.social.domain.model.Feed;
import com.kscold.blog.social.domain.port.out.FeedRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/** 비공개 피드의 존재와 하위 리소스를 작성자·관리자 외 사용자에게 노출하지 않는다. */
@Component
@RequiredArgsConstructor
public class FeedAccessPolicy {

    private static final String ANONYMOUS_PRINCIPAL = "anonymousUser";

    private final FeedRepository feedRepository;

    public Feed requireReadable(String feedId, String userId, boolean isAdmin) {
        Feed feed =
                feedRepository
                        .findById(feedId)
                        .orElseThrow(() -> ResourceNotFoundException.feed(feedId));
        if (feed.getVisibility() == Feed.Visibility.PUBLIC || isAdmin || isOwner(feed, userId)) {
            return feed;
        }

        throw ResourceNotFoundException.feed(feedId);
    }

    private boolean isOwner(Feed feed, String userId) {
        return StringUtils.hasText(userId)
                && !ANONYMOUS_PRINCIPAL.equals(userId)
                && feed.getAuthor() != null
                && userId.equals(feed.getAuthor().getId());
    }
}
