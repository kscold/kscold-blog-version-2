package com.kscold.blog.analytics.adapter.in.web.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class PageVisitRequest {
    @NotBlank
    @Size(max = 2048, message = "방문 경로가 너무 깁니다")
    private String path;
}
