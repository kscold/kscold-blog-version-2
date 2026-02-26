package com.kscold.blog.dto.request;

import com.kscold.blog.model.Feed;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FeedCreateRequest {

    @NotBlank(message = "내용은 필수입니다")
    private String content;

    private List<String> images;

    private Feed.Visibility visibility = Feed.Visibility.PUBLIC;

    private String linkUrl;
}
