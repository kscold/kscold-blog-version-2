package com.kscold.blog.adminnight.adapter.in.web.dto.request;

import static org.assertj.core.api.Assertions.assertThat;

import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class AdminNightRequestValidationTest {

    @Test
    void 신청_경계에서_과도한_문자열과_중첩_슬롯을_거부한다() {
        CreateRequest request =
                CreateRequest.builder()
                        .requesterName("가".repeat(41))
                        .taskTitle("Agent 개선")
                        .message("완성하기")
                        .participationMode(AdminNightRequest.ParticipationMode.ONLINE)
                        .preferredSlot(
                                SlotRequest.builder()
                                        .slotKey("slot")
                                        .date(LocalDate.of(2026, 9, 5))
                                        .weekday("토")
                                        .timeLabel("20:00-22:00")
                                        .focus("가".repeat(121))
                                        .badgeLabel("저녁")
                                        .build())
                        .build();

        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            Validator validator = factory.getValidator();
            assertThat(validator.validate(request))
                    .extracting(violation -> violation.getPropertyPath().toString())
                    .contains("requesterName", "preferredSlot.focus");
        }
    }
}
