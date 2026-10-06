package com.kscold.blog.exception;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;

class ValidationMessagesTest {

    @Test
    void fieldErrorsFollowTheDeclaredFieldOrderWhateverOrderTheyWereReportedIn() {
        String expected = "아이디를 입력해주세요., 비밀번호를 입력해주세요., 이메일 형식이 올바르지 않습니다.";

        assertThat(
                        ValidationMessages.join(
                                errors(
                                        new SignupForm(),
                                        error("username", "아이디를 입력해주세요."),
                                        error("password", "비밀번호를 입력해주세요."),
                                        error("email", "이메일 형식이 올바르지 않습니다."))))
                .isEqualTo(expected);
        assertThat(
                        ValidationMessages.join(
                                errors(
                                        new SignupForm(),
                                        error("email", "이메일 형식이 올바르지 않습니다."),
                                        error("password", "비밀번호를 입력해주세요."),
                                        error("username", "아이디를 입력해주세요."))))
                .isEqualTo(expected);
    }

    @Test
    void nestedAndIndexedPathsFollowTheFieldTheyBelongTo() {
        BindingResult result =
                errors(
                        new SignupForm(),
                        error("tags[1]", "태그가 너무 깁니다."),
                        error("profile.nickname", "닉네임을 입력해주세요."),
                        error("username", "아이디를 입력해주세요."));

        assertThat(ValidationMessages.join(result))
                .isEqualTo("아이디를 입력해주세요., 닉네임을 입력해주세요., 태그가 너무 깁니다.");
    }

    @Test
    void fieldsMissingFromTheRequestObjectComeLastInNameOrder() {
        BindingResult result =
                errors(
                        new SignupForm(),
                        error("zeta", "마지막"),
                        error("alpha", "그다음"),
                        error("email", "먼저"));

        assertThat(ValidationMessages.join(result)).isEqualTo("먼저, 그다음, 마지막");
    }

    @Test
    void severalMessagesOnOneFieldKeepAStableOrder() {
        BindingResult result =
                errors(
                        new SignupForm(),
                        error("password", "특수문자를 포함해주세요."),
                        error("password", "8자 이상 입력해주세요."));

        assertThat(ValidationMessages.join(result)).isEqualTo("8자 이상 입력해주세요., 특수문자를 포함해주세요.");
    }

    @Test
    void constraintViolationsFollowThePropertyPathAndDropRepeatedMessages() {
        Validator validator = Validation.buildDefaultValidatorFactory().getValidator();
        List<ConstraintViolation<Contact>> violations =
                new ArrayList<>(validator.validate(new Contact()));
        assertThat(violations).hasSize(3);
        List<ConstraintViolation<Contact>> reversed = new ArrayList<>(violations);
        Collections.reverse(reversed);

        assertThat(ValidationMessages.join(violations))
                .isEqualTo(ValidationMessages.join(reversed))
                .isEqualTo("연락처를 입력해주세요., 이름을 입력해주세요.");
    }

    private static BindingResult errors(Object target, FieldError... fieldErrors) {
        BindingResult result = new BeanPropertyBindingResult(target, "request");
        for (FieldError fieldError : fieldErrors) {
            result.addError(fieldError);
        }
        return result;
    }

    private static FieldError error(String field, String message) {
        return new FieldError("request", field, message);
    }

    @SuppressWarnings("unused")
    private static final class SignupForm {
        private String username;
        private String password;
        private String email;
        private Profile profile;
        private List<String> tags;
    }

    @SuppressWarnings("unused")
    private static final class Profile {
        private String nickname;
    }

    @SuppressWarnings("unused")
    private static final class Contact {
        @NotBlank(message = "이름을 입력해주세요.")
        private String name;

        @NotBlank(message = "연락처를 입력해주세요.")
        private String email;

        @NotBlank(message = "연락처를 입력해주세요.")
        private String phone;
    }
}
