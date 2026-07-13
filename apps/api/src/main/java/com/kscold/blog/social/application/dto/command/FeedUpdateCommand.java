package com.kscold.blog.social.application.dto.command;

import com.kscold.blog.social.domain.model.Feed;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class FeedUpdateCommand {

    private String content;

    private List<String> images;

    private Feed.Visibility visibility;

    private String linkUrl;
}
