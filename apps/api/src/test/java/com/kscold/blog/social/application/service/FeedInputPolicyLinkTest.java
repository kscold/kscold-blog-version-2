package com.kscold.blog.social.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.social.application.dto.command.FeedCreateCommand;
import com.kscold.blog.social.application.dto.command.FeedUpdateCommand;
import com.kscold.blog.social.domain.model.Feed;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class FeedInputPolicyLinkTest {

    private static final String LINK_PREFIX = "https://example.com/";

    private final FeedInputPolicy policy = new FeedInputPolicy("https://bucket.kscold.com", "blog");

    @Test
    void 생성링크를앞뒤공백없이준비한다() {
        FeedInputPolicy.PreparedCreate prepared =
                policy.prepareCreate(
                        FeedCreateCommand.builder()
                                .content("본문")
                                .linkUrl("  https://example.com/post?q=1  ")
                                .build());

        assertThat(prepared.linkUrl()).isEqualTo("https://example.com/post?q=1");
    }

    @Test
    void 생성의빈링크는없는값으로준비한다() {
        FeedInputPolicy.PreparedCreate prepared =
                policy.prepareCreate(
                        FeedCreateCommand.builder().content("본문").linkUrl("  ").build());

        assertThat(prepared.linkUrl()).isNull();
    }

    @Test
    void 수정의생략링크와빈링크를구분한다() {
        Feed current = currentFeed();

        FeedInputPolicy.PreparedUpdate omitted =
                policy.prepareUpdate(current, FeedUpdateCommand.builder().build());
        FeedInputPolicy.PreparedUpdate blank =
                policy.prepareUpdate(current, FeedUpdateCommand.builder().linkUrl(" \n").build());

        assertThat(omitted.linkUpdate().action()).isEqualTo(FeedInputPolicy.LinkAction.UNCHANGED);
        assertThat(blank.linkUpdate().action()).isEqualTo(FeedInputPolicy.LinkAction.REMOVE);
    }

    @Test
    void 이천사십팔자링크를허용한다() {
        String link = linkWithLength(2_048);

        FeedInputPolicy.PreparedCreate prepared =
                policy.prepareCreate(
                        FeedCreateCommand.builder().content("본문").linkUrl(link).build());

        assertThat(prepared.linkUrl()).hasSize(2_048);
    }

    @Test
    void 이천사십구자링크를거부한다() {
        FeedCreateCommand command =
                FeedCreateCommand.builder().content("본문").linkUrl(linkWithLength(2_049)).build();

        assertThatThrownBy(() -> policy.prepareCreate(command))
                .isInstanceOf(InvalidRequestException.class);
    }

    @ParameterizedTest
    @ValueSource(
            strings = {
                "/relative",
                "ftp://example.com/file",
                "https://user@example.com/post",
                "https://example.com:444/post",
                "https://exa mple.com/post"
            })
    void 기본형식이잘못된링크를거부한다(String link) {
        FeedCreateCommand command = FeedCreateCommand.builder().content("본문").linkUrl(link).build();

        assertThatThrownBy(() -> policy.prepareCreate(command))
                .isInstanceOf(InvalidRequestException.class);
    }

    private Feed currentFeed() {
        return Feed.builder()
                .content("기존 본문")
                .images(List.of())
                .visibility(Feed.Visibility.PUBLIC)
                .build();
    }

    private String linkWithLength(int length) {
        return LINK_PREFIX + "a".repeat(length - LINK_PREFIX.length());
    }
}
