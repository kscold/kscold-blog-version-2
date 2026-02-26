package com.kscold.blog.dto.request;

import com.kscold.blog.model.Feed;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FeedUpdateRequest {

    private String content;

    private List<String> images;

    private Feed.Visibility visibility;

    private String linkUrl;
}
