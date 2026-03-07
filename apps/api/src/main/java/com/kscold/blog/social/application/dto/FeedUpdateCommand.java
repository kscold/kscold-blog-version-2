package com.kscold.blog.social.application.dto;

import com.kscold.blog.social.domain.model.Feed;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FeedUpdateCommand {

    private String content;

    private List<String> images;

    private Feed.Visibility visibility;

    private String linkUrl;
}
