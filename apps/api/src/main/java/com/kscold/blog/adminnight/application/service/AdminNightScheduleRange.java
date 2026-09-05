package com.kscold.blog.adminnight.application.service;

import com.kscold.blog.exception.InvalidRequestException;
import java.time.LocalDate;

final class AdminNightScheduleRange {

    private AdminNightScheduleRange() {}

    static void validate(LocalDate from, LocalDate to) {
        if (from == null || to == null) {
            throw InvalidRequestException.invalidInput("조회 시작일과 종료일이 필요합니다.");
        }
        if (from.isAfter(to)) {
            throw InvalidRequestException.invalidInput("조회 시작일은 종료일보다 늦을 수 없습니다.");
        }
    }
}
