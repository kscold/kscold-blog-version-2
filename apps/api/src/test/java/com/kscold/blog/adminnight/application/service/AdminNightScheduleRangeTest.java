package com.kscold.blog.adminnight.application.service;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.kscold.blog.exception.InvalidRequestException;
import java.time.LocalDate;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class AdminNightScheduleRangeTest {

    private static final LocalDate FROM = LocalDate.of(2026, 9, 5);
    private static final LocalDate TO = LocalDate.of(2026, 9, 12);

    @Test
    @DisplayName("조회 시작일과 종료일이 같은 날이어도 허용한다")
    void acceptsSameBoundaryDate() {
        assertThatCode(() -> AdminNightScheduleRange.validate(FROM, FROM))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("조회 시작일이 종료일보다 늦으면 거부한다")
    void rejectsReversedRange() {
        assertThatThrownBy(() -> AdminNightScheduleRange.validate(TO, FROM))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessage("조회 시작일은 종료일보다 늦을 수 없습니다.");
    }

    @Test
    @DisplayName("조회 경계가 누락되면 거부한다")
    void rejectsMissingBoundary() {
        assertThatThrownBy(() -> AdminNightScheduleRange.validate(null, TO))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessage("조회 시작일과 종료일이 필요합니다.");
    }
}
