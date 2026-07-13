package com.kscold.blog.social.application.dto.command;

import com.kscold.blog.social.domain.model.Feed;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class FeedCreateCommand {

    @NotBlank(message = "내용은 필수입니다")
    private String content;

    private List<String> images;

    @Builder.Default private Feed.Visibility visibility = Feed.Visibility.PUBLIC;

    private String linkUrl;
}
