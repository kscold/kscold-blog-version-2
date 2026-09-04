package com.kscold.blog.adminnight.adapter.in.web.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ReviewRequest {

    @Size(max = 1000, message = "검토 메모는 최대 1000자입니다")
    private String reviewNote;
}
