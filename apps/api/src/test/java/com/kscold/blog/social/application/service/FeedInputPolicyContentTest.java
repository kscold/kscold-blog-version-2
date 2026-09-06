package com.kscold.blog.social.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.social.application.dto.command.FeedCreateCommand;
import com.kscold.blog.social.application.dto.command.FeedUpdateCommand;
import com.kscold.blog.social.domain.model.Feed;
import java.util.List;
import org.junit.jupiter.api.Test;

class FeedInputPolicyContentTest {

    private final FeedInputPolicy policy = new FeedInputPolicy("https://bucket.kscold.com", "blog");

    @Test
    void 만자본문의서식을그대로유지한다() {
        String content = " " + "가".repeat(9_998) + "\n";

        FeedInputPolicy.PreparedCreate prepared =
                policy.prepareCreate(FeedCreateCommand.builder().content(content).build());

        assertThat(prepared.content()).isEqualTo(content).hasSize(10_000);
    }

    @Test
    void 만자를넘는본문을거부한다() {
        FeedCreateCommand command = FeedCreateCommand.builder().content("가".repeat(10_001)).build();

        assertThatThrownBy(() -> policy.prepareCreate(command))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("10,000자");
    }

    @Test
    void 공백뿐인본문은빈문자열로정규화한다() {
        FeedInputPolicy.PreparedCreate prepared =
                policy.prepareCreate(
                        FeedCreateCommand.builder()
                                .content(" \n\t")
                                .images(List.of("https://bucket.kscold.com/blog/example.png"))
                                .build());

        assertThat(prepared.content()).isEmpty();
    }

    @Test
    void 수정최종상태가비면거부한다() {
        Feed current =
                Feed.builder()
                        .content("기존 내용")
                        .images(List.of())
                        .visibility(Feed.Visibility.PUBLIC)
                        .build();
        FeedUpdateCommand command =
                FeedUpdateCommand.builder().content(" ").images(List.of()).build();

        assertThatThrownBy(() -> policy.prepareUpdate(current, command))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("내용 또는 이미지");
    }
}
