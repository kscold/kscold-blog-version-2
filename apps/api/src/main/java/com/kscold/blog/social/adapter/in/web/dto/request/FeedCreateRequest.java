package com.kscold.blog.social.adapter.in.web.dto.request;

import static com.kscold.blog.social.application.service.FeedInputPolicy.CONTENT_MAX_LENGTH;
import static com.kscold.blog.social.application.service.FeedInputPolicy.IMAGE_MAX_COUNT;
import static com.kscold.blog.social.application.service.FeedInputPolicy.URL_MAX_LENGTH;

import com.kscold.blog.social.application.dto.command.FeedCreateCommand;
import com.kscold.blog.social.domain.model.Feed;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class FeedCreateRequest {

    @Size(max = CONTENT_MAX_LENGTH, message = "피드 내용은 10,000자까지 입력할 수 있습니다")
    private String content;

    @Size(max = IMAGE_MAX_COUNT, message = "이미지는 최대 4개까지 첨부할 수 있습니다")
    private List<
                    @NotBlank(message = "이미지 URL을 입력해주세요")
                    @Size(max = URL_MAX_LENGTH, message = "이미지 URL은 2,048자까지 입력할 수 있습니다") String>
            images;

    private Feed.Visibility visibility;

    @Size(max = URL_MAX_LENGTH, message = "링크 URL은 2,048자까지 입력할 수 있습니다")
    private String linkUrl;

    public FeedCreateCommand toCommand() {
        return FeedCreateCommand.builder()
                .content(content)
                .images(images == null ? null : new ArrayList<>(images))
                .visibility(visibility)
                .linkUrl(linkUrl)
                .build();
    }
}
