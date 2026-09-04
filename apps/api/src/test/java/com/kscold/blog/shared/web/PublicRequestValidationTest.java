package com.kscold.blog.shared.web;

import static org.assertj.core.api.Assertions.assertThat;

import com.kscold.blog.analytics.adapter.in.web.dto.request.PageVisitRequest;
import com.kscold.blog.identity.application.dto.command.LoginCommand;
import com.kscold.blog.identity.application.dto.command.RefreshTokenCommand;
import com.kscold.blog.identity.application.dto.command.RegisterCommand;
import com.kscold.blog.identity.application.dto.command.ResetPasswordCommand;
import com.kscold.blog.payment.application.dto.command.CompletePaymentCommand;
import com.kscold.blog.teamprivate.adapter.in.web.dto.request.PasswordRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.constraints.Size;
import java.util.Set;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

class PublicRequestValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @Test
    void rejectsOversizedPageVisitPath() {
        PageVisitRequest request = PageVisitRequest.builder().path("/" + "a".repeat(2048)).build();

        assertThat(hasSizeViolation(request, "path")).isTrue();
    }

    @Test
    void rejectsOversizedAuthenticationFields() {
        RegisterCommand register =
                RegisterCommand.builder()
                        .email("user@example.com")
                        .username("valid_user")
                        .password("a".repeat(73))
                        .displayName("가".repeat(31))
                        .build();
        LoginCommand login =
                LoginCommand.builder().email("user@example.com").password("a".repeat(73)).build();
        RefreshTokenCommand refresh =
                RefreshTokenCommand.builder().refreshToken("a".repeat(2049)).build();
        ResetPasswordCommand reset =
                ResetPasswordCommand.builder()
                        .token("a".repeat(257))
                        .newPassword("a".repeat(73))
                        .build();

        assertThat(hasSizeViolation(register, "password")).isTrue();
        assertThat(hasSizeViolation(register, "displayName")).isTrue();
        assertThat(hasSizeViolation(login, "password")).isTrue();
        assertThat(hasSizeViolation(refresh, "refreshToken")).isTrue();
        assertThat(hasSizeViolation(reset, "token")).isTrue();
        assertThat(hasSizeViolation(reset, "newPassword")).isTrue();
    }

    @Test
    void rejectsOversizedPublicLookupFields() {
        CompletePaymentCommand payment =
                CompletePaymentCommand.builder().paymentId("a".repeat(101)).build();
        PasswordRequest teamRequest =
                PasswordRequest.builder().password("a".repeat(257)).teamId("a".repeat(65)).build();

        assertThat(hasSizeViolation(payment, "paymentId")).isTrue();
        assertThat(hasSizeViolation(teamRequest, "password")).isTrue();
        assertThat(hasSizeViolation(teamRequest, "teamId")).isTrue();
    }

    private boolean hasSizeViolation(Object request, String property) {
        Set<ConstraintViolation<Object>> violations = validator.validate(request);
        return violations.stream()
                .anyMatch(
                        violation ->
                                violation.getPropertyPath().toString().equals(property)
                                        && violation
                                                .getConstraintDescriptor()
                                                .getAnnotation()
                                                .annotationType()
                                                .equals(Size.class));
    }
}
