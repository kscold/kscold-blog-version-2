package com.kscold.blog.social.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.social.application.dto.command.FeedCreateCommand;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;

class FeedInputPolicyImageTest {

    private static final String IMAGE_PREFIX = "https://bucket.kscold.com/blog/";

    private final FeedInputPolicy policy = new FeedInputPolicy("https://bucket.kscold.com", "blog");

    @Test
    void 이미지네개까지허용하고목록을복사한다() {
        List<String> images =
                new ArrayList<>(
                        List.of(image("1.jpg"), image("2.jpeg"), image("3.GIF"), image("4.webp")));

        FeedInputPolicy.PreparedCreate prepared = policy.prepareCreate(command(images));
        images.clear();

        assertThat(prepared.images()).hasSize(4);
    }

    @Test
    void 이미지다섯개를거부한다() {
        List<String> images =
                List.of(
                        image("1.png"),
                        image("2.png"),
                        image("3.png"),
                        image("4.png"),
                        image("5.png"));

        assertThatThrownBy(() -> policy.prepareCreate(command(images)))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("최대 4개");
    }

    @Test
    void 이천사십팔자이미지주소를허용한다() {
        String image = imageWithLength(2_048);

        FeedInputPolicy.PreparedCreate prepared = policy.prepareCreate(command(List.of(image)));

        assertThat(prepared.images()).singleElement().asString().hasSize(2_048);
    }

    @Test
    void 이천사십구자이미지주소를거부한다() {
        String image = imageWithLength(2_049);

        assertThatThrownBy(() -> policy.prepareCreate(command(List.of(image))))
                .isInstanceOf(InvalidRequestException.class);
    }

    @Test
    void 아스키변환뒤이천사십팔자를넘는이미지주소를거부한다() {
        String image =
                IMAGE_PREFIX + "가".repeat(2_048 - IMAGE_PREFIX.length() - ".png".length()) + ".png";

        assertThat(image).hasSize(2_048);
        assertThatThrownBy(() -> policy.prepareCreate(command(List.of(image))))
                .isInstanceOf(InvalidRequestException.class);
    }

    @Test
    void 정규화뒤같은이미지주소는중복으로거부한다() {
        List<String> images =
                List.of(
                        "https://BUCKET.KSCOLD.COM/blog/example.png",
                        "https://bucket.kscold.com/blog/example.png");

        assertThatThrownBy(() -> policy.prepareCreate(command(images)))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("중복");
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(
            strings = {
                "",
                " ",
                "http://bucket.kscold.com/blog/example.png",
                "https://other.example/blog/example.png",
                "https://user@bucket.kscold.com/blog/example.png",
                "https://bucket.kscold.com:444/blog/example.png",
                "https://bucket.kscold.com/blog/example.png?size=large",
                "https://bucket.kscold.com/blog/example.png#image",
                "https://bucket.kscold.com/other/example.png",
                "https://bucket.kscold.com/blog/../example.png",
                "https://bucket.kscold.com/blog/%2e%2e/example.png",
                "https://bucket.kscold.com/blog/example.svg"
            })
    void 저장소정책을벗어난이미지주소를거부한다(String image) {
        assertThatThrownBy(() -> policy.prepareCreate(command(Collections.singletonList(image))))
                .isInstanceOf(InvalidRequestException.class);
    }

    private FeedCreateCommand command(List<String> images) {
        return FeedCreateCommand.builder().content("본문").images(images).build();
    }

    private String image(String filename) {
        return IMAGE_PREFIX + filename;
    }

    private String imageWithLength(int length) {
        return IMAGE_PREFIX + "a".repeat(length - IMAGE_PREFIX.length() - 4) + ".png";
    }
}
