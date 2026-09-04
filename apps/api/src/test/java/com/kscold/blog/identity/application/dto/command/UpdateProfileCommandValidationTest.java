package com.kscold.blog.identity.application.dto.command;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class UpdateProfileCommandValidationTest {

    @Test
    void 프로필_요청_경계에서_과도한_필드와_지원하지_않는_링크를_거부한다() {
        UpdateProfileCommand command =
                UpdateProfileCommand.builder()
                        .displayName("가".repeat(41))
                        .socialLinks(Map.of("custom", "https://example.com"))
                        .techStack(List.of("가".repeat(41)))
                        .build();

        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            Validator validator = factory.getValidator();
            assertThat(validator.validate(command))
                    .extracting(violation -> violation.getPropertyPath().toString())
                    .contains(
                            "displayName",
                            "socialLinks<K>[custom].<map key>",
                            "techStack[0].<list element>");
        }
    }
}
