package com.kscold.blog.teamprivate.adapter.in.web.dto.request;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.Test;

class PasswordRequestValidationTest {

    @Test
    void 비밀번호가_공백이면_요청을_거부한다() {
        PasswordRequest request = PasswordRequest.builder().password(" ").build();

        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            Validator validator = factory.getValidator();
            assertThat(validator.validate(request))
                    .extracting(violation -> violation.getPropertyPath().toString())
                    .containsExactly("password");
        }
    }
}
