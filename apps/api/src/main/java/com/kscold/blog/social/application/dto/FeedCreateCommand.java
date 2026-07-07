package com.kscold.blog.social.application.dto;

import com.kscold.blog.social.domain.model.Feed;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FeedCreateCommand {

    @NotBlank(message = "내용은 필수입니다")
    private String content;

    private List<String> images;

    private Feed.Visibility visibility = Feed.Visibility.PUBLIC;

    private String linkUrl;
}
