package com.kscold.blog.social.adapter.in.web.dto.request;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

class FeedRequestValidationTest {

    private static ValidatorFactory validatorFactory;
    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validator = validatorFactory.getValidator();
    }

    @AfterAll
    static void closeValidator() {
        validatorFactory.close();
    }

    @Test
    void 생성요청은본문만자를허용하고초과값을거부한다() {
        FeedCreateRequest boundary =
                FeedCreateRequest.builder().content("가".repeat(10_000)).build();
        FeedCreateRequest exceeded =
                FeedCreateRequest.builder().content("가".repeat(10_001)).build();

        assertThat(validator.validate(boundary)).isEmpty();
        assertThat(validator.validate(exceeded))
                .anyMatch(violation -> violation.getPropertyPath().toString().equals("content"));
    }

    @Test
    void 수정요청은이미지네개를허용하고다섯개를거부한다() {
        List<String> four = List.of(image("1.png"), image("2.png"), image("3.png"), image("4.png"));
        List<String> five =
                List.of(
                        image("1.png"),
                        image("2.png"),
                        image("3.png"),
                        image("4.png"),
                        image("5.png"));

        assertThat(validator.validate(FeedUpdateRequest.builder().images(four).build())).isEmpty();
        assertThat(validator.validate(FeedUpdateRequest.builder().images(five).build()))
                .anyMatch(violation -> violation.getPropertyPath().toString().equals("images"));
    }

    @Test
    void 이미지주소는이천사십팔자를허용하고초과값과빈값을거부한다() {
        String boundary = "https://example.com/" + "a".repeat(2_028);
        String exceeded = boundary + "a";

        assertThat(
                        validator.validate(
                                FeedCreateRequest.builder()
                                        .content("본문")
                                        .images(List.of(boundary))
                                        .build()))
                .isEmpty();
        assertThat(
                        validator.validate(
                                FeedCreateRequest.builder()
                                        .content("본문")
                                        .images(List.of(exceeded, " "))
                                        .build()))
                .hasSize(2);
    }

    @Test
    void 링크주소는이천사십팔자를허용하고초과값을거부한다() {
        String boundary = "https://example.com/" + "a".repeat(2_028);
        String exceeded = boundary + "a";

        assertThat(validator.validate(FeedUpdateRequest.builder().linkUrl(boundary).build()))
                .isEmpty();
        assertThat(validator.validate(FeedUpdateRequest.builder().linkUrl(exceeded).build()))
                .anyMatch(violation -> violation.getPropertyPath().toString().equals("linkUrl"));
    }

    private String image(String filename) {
        return "https://bucket.kscold.com/blog/" + filename;
    }
}
